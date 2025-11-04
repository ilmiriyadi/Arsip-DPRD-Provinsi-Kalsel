import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Zod schema untuk validasi
const suratKeluarSchema = z.object({
  noUrut: z.number().min(1, "Nomor urut wajib diisi"),
  klas: z.string().min(1, "Klas wajib diisi"),
  pengolah: z.enum(['KETUA_DPRD', 'WAKIL_KETUA_1', 'WAKIL_KETUA_2', 'WAKIL_KETUA_3', 'SEKWAN']),
  tanggalSurat: z.string().min(1, "Tanggal surat wajib diisi"),
  perihalSurat: z.string().min(1, "Perihal surat wajib diisi"),
  kirimKepada: z.string().min(1, "Kirim kepada wajib diisi"),
  suratMasukId: z.string().optional()
})

// GET /api/surat-keluar - Get all surat keluar with pagination
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    
    const skip = (page - 1) * limit

    const where = search 
      ? {
          OR: [
            { perihalSurat: { contains: search, mode: 'insensitive' as const } },
            { kirimKepada: { contains: search, mode: 'insensitive' as const } },
            { klas: { contains: search, mode: 'insensitive' as const } }
          ]
        }
      : {}

    const [suratKeluar, total] = await Promise.all([
      prisma.suratKeluar.findMany({
        where,
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          suratMasuk: {
            select: {
              id: true,
              nomorSurat: true,
              perihal: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.suratKeluar.count({ where })
    ])

    return NextResponse.json({
      data: suratKeluar,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching surat keluar:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/surat-keluar - Create new surat keluar
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Convert noUrut to number for validation
    const validationData = {
      ...body,
      noUrut: parseInt(body.noUrut)
    }

    // Validate with Zod
    const result = suratKeluarSchema.safeParse(validationData)
    
    if (!result.success) {
      const errors = result.error.issues.map((err) => ({
        field: err.path.join('.'),
        message: err.message
      }))
      return NextResponse.json(
        { error: 'Validation failed', details: errors },
        { status: 400 }
      )
    }

    const { noUrut, klas, pengolah, tanggalSurat, perihalSurat, kirimKepada, suratMasukId } = result.data

    // Check if noUrut already exists
    const existingSurat = await prisma.suratKeluar.findUnique({
      where: { noUrut }
    })

    if (existingSurat) {
      return NextResponse.json(
        { error: 'Nomor urut sudah digunakan' },
        { status: 400 }
      )
    }

    // Create surat keluar
    const suratKeluar = await prisma.suratKeluar.create({
      data: {
        noUrut,
        klas,
        pengolah,
        tanggalSurat: new Date(tanggalSurat),
        perihalSurat,
        kirimKepada,
        suratMasukId: suratMasukId || null,
        createdById: session.user.id
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        suratMasuk: {
          select: {
            id: true,
            nomorSurat: true,
            perihal: true
          }
        }
      }
    })

    return NextResponse.json(suratKeluar, { status: 201 })
  } catch (error) {
    console.error('Error creating surat keluar:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}