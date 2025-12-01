import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { withCsrfProtection } from "@/lib/csrf"

const suratMasukSchema = z.object({
  noUrut: z.number().min(1, "No urut wajib diisi"),
  nomorSurat: z.string().optional().transform(val => val && val.trim() !== '' ? val : undefined),
  tanggalSurat: z.string().datetime(),
  tanggalDiteruskan: z.string().datetime(),
  asalSurat: z.string().min(1, "Asal surat wajib diisi"),
  perihal: z.string().min(1, "Perihal wajib diisi"),
  keterangan: z.string().optional().transform(val => val && val.trim() !== '' ? val : undefined),
  filePath: z.string().optional(),
})

// GET - Ambil semua surat masuk
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
    const searchField = searchParams.get("searchField") || "noUrut"
    const tanggal = searchParams.get("tanggal")
    const bulan = searchParams.get("bulan")

    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}

    if (search) {
      switch(searchField) {
        case 'noUrut':
          const searchNumber = parseInt(search)
          if (!isNaN(searchNumber)) {
            where.noUrut = searchNumber
          }
          break
        case 'nomorSurat':
          where.nomorSurat = {
            contains: search,
            mode: 'insensitive'
          }
          break
        case 'asalSurat':
          where.asalSurat = {
            contains: search,
            mode: 'insensitive'
          }
          break
        case 'perihal':
          where.perihal = {
            contains: search,
            mode: 'insensitive'
          }
          break
      }
    }

    if (tanggal) {
      const targetDate = new Date(tanggal)
      const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate())
      const endOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() + 1)
      
      where.tanggalSurat = {
        gte: startOfDay,
        lt: endOfDay,
      }
    }

    if (bulan) {
      const [year, month] = bulan.split('-').map(Number)
      const startOfMonth = new Date(year, month - 1, 1)
      const endOfMonth = new Date(year, month, 1)
      
      where.tanggalSurat = {
        gte: startOfMonth,
        lt: endOfMonth,
      }
    }

    const [suratMasuk, total] = await Promise.all([
      prisma.suratMasuk.findMany({
        where,
        select: {
          id: true,
          noUrut: true,
          nomorSurat: true,
          tanggalSurat: true,
          tanggalDiteruskan: true,
          asalSurat: true,
          perihal: true,
          keterangan: true,
          filePath: true,
          createdAt: true,
          updatedAt: true,
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          },
          _count: {
            select: {
              disposisi: true,
              suratKeluar: true,
            }
          }
        },
        orderBy: { noUrut: "desc" },
        skip,
        take: limit,
      }),
      prisma.suratMasuk.count({ where }),
    ])

    return NextResponse.json({
      suratMasuk,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    })
  } catch (error) {
    console.error("Error fetching surat masuk:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    )
  }
}

// POST - Tambah surat masuk baru
export async function POST(req: NextRequest) {
  return withCsrfProtection(req, async (request) => {
    try {
      const session = await getServerSession(authOptions)
      if (!session || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }

      console.log("Session user ID:", session.user.id)

      const body = await request.json()
    console.log("Request body:", body)
    
    const data = suratMasukSchema.parse(body)
    console.log("Parsed data:", data)

    // Cek apakah noUrut sudah ada
    const existingSurat = await prisma.suratMasuk.findFirst({
      where: { noUrut: data.noUrut }
    })
    
    if (existingSurat) {
      return NextResponse.json(
        { error: `No urut ${data.noUrut} sudah digunakan` },
        { status: 400 }
      )
    }

    const suratMasuk = await prisma.suratMasuk.create({
      data: {
        ...data,
        nomorSurat: data.nomorSurat || null,
        tanggalSurat: new Date(data.tanggalSurat),
        tanggalDiteruskan: new Date(data.tanggalDiteruskan),
        createdById: session.user.id,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    })

    return NextResponse.json(suratMasuk, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    console.error("Error creating surat masuk:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    )
  }
  })
}