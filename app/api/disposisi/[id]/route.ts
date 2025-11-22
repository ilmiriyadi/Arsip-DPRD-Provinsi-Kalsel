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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const disposisi = await prisma.disposisi.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        suratMasuk: true
      }
    })

    if (!disposisi) {
      return NextResponse.json(
        { error: "Disposisi tidak ditemukan" },
        { status: 404 }
      )
    }

    return NextResponse.json(disposisi)
  } catch (error) {
    console.error("Error fetching disposisi:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withCsrfProtection(req, async (request) => {
    try {
      const session = await getServerSession(authOptions)
      if (!session || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }

      const { id } = await params
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

    const updatedDisposisi = await prisma.disposisi.update({
      where: { id },
      data: {
        ...data,
        nomorDisposisi,
        tanggalDisposisi: new Date(data.tanggalDisposisi),
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        suratMasuk: true
      }
    })

    return NextResponse.json(updatedDisposisi)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    console.error("Error updating disposisi:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    )
  }
  })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withCsrfProtection(req, async (request) => {
    try {
      const session = await getServerSession(authOptions)
      if (!session || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }

      const { id } = await params
      await prisma.disposisi.delete({
        where: { id }
      })

      return NextResponse.json({ message: "Disposisi berhasil dihapus" })
    } catch (error) {
      console.error("Error deleting disposisi:", error)
      return NextResponse.json(
        { error: "Terjadi kesalahan server" },
        { status: 500 }
      )
    }
  })
}