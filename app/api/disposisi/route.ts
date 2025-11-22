import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { withCsrfProtection } from "@/lib/csrf"

const disposisiSchema = z.object({
  noUrut: z.number().min(1, "No urut wajib diisi"),
  tanggalDisposisi: z.string().datetime(),
  tujuanDisposisi: z.string().min(1, "Tujuan disposisi wajib diisi"),
  isiDisposisi: z.string().min(1, "Isi disposisi wajib diisi"),
  keterangan: z.string().optional(),
  status: z.enum(["SELESAI"]).optional(),
  suratMasukId: z.string().min(1, "ID surat masuk wajib diisi"),
  nomorDisposisi: z.string().optional(),
})

// GET - Ambil semua disposisi
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status")
    const suratMasukId = searchParams.get("suratMasukId")

    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}

    if (search) {
      where.OR = [
        { tujuanDisposisi: { contains: search, mode: "insensitive" } },
        { isiDisposisi: { contains: search, mode: "insensitive" } },
        {
          suratMasuk: {
            nomorSurat: { contains: search, mode: "insensitive" }
          }
        }
      ]
    }

    if (status) {
      where.status = status
    }

    if (suratMasukId) {
      where.suratMasukId = suratMasukId
    }

    const [disposisi, total] = await Promise.all([
      prisma.disposisi.findMany({
        where,
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          },
          suratMasuk: {
            select: {
              id: true,
              nomorSurat: true,
              perihal: true,
            }
          }
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.disposisi.count({ where }),
    ])

    return NextResponse.json({
      disposisi,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    })
  } catch (error) {
    console.error("Error fetching disposisi:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    )
  }
}

// POST - Tambah disposisi baru
export async function POST(req: NextRequest) {
  return withCsrfProtection(req, async (request) => {
    try {
      const session = await getServerSession(authOptions)
      if (!session || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }

      const body = await request.json()
    const data = disposisiSchema.parse(body)

    // Cek apakah surat masuk yang dipilih ada dan ambil noUrut-nya
    const suratMasuk = await prisma.suratMasuk.findUnique({
      where: { id: data.suratMasukId }
    })
    
    if (!suratMasuk) {
      return NextResponse.json(
        { error: "Surat masuk tidak ditemukan" },
        { status: 404 }
      )
    }

    // Validasi bahwa noUrut disposisi harus sama dengan noUrut surat masuk
    if (data.noUrut !== suratMasuk.noUrut) {
      return NextResponse.json(
        { error: `No urut disposisi harus sama dengan no urut surat masuk (${suratMasuk.noUrut})` },
        { status: 400 }
      )
    }

    // Generate nomorDisposisi otomatis: DISP/SM{noUrut}/DSP/MM/YYYY
    const tanggal = new Date(data.tanggalDisposisi)
    const bulan = (tanggal.getMonth() + 1).toString().padStart(2, '0')
    const tahun = tanggal.getFullYear()
    const nomorDisposisi = `DISP/SM${data.noUrut.toString().padStart(3, '0')}/DSP/${bulan}/${tahun}`

    const disposisi = await prisma.disposisi.create({
      data: {
        ...data,
        nomorDisposisi,
        tanggalDisposisi: new Date(data.tanggalDisposisi),
        status: data.status || "SELESAI",
        createdById: session.user.id,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        suratMasuk: {
          select: {
            id: true,
            nomorSurat: true,
            perihal: true,
          }
        }
      }
    })

    return NextResponse.json(disposisi, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    console.error("Error creating disposisi:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    )
  }
  })
}