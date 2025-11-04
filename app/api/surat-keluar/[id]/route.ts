import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Define enum manually since it might not be exported yet
enum PengolahSurat {
  KETUA_DPRD = 'KETUA_DPRD',
  WAKIL_KETUA_1 = 'WAKIL_KETUA_1',
  WAKIL_KETUA_2 = 'WAKIL_KETUA_2',
  WAKIL_KETUA_3 = 'WAKIL_KETUA_3',
  SEKWAN = 'SEKWAN'
}

// GET /api/surat-keluar/[id] - Get specific surat keluar
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const suratKeluar = await prisma.suratKeluar.findUnique({
      where: { id },
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
            perihal: true,
            asalSurat: true
          }
        }
      }
    })

    if (!suratKeluar) {
      return NextResponse.json(
        { error: 'Surat keluar tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json(suratKeluar)
  } catch (error) {
    console.error('Error fetching surat keluar detail:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/surat-keluar/[id] - Update surat keluar
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      noUrut, 
      klas, 
      pengolah, 
      tanggalSurat, 
      perihalSurat, 
      kirimKepada,
      suratMasukId
    } = body

    // Check if surat keluar exists
    const existingSurat = await prisma.suratKeluar.findUnique({
      where: { id }
    })

    if (!existingSurat) {
      return NextResponse.json(
        { error: 'Surat keluar tidak ditemukan' },
        { status: 404 }
      )
    }

    // Check if noUrut is being changed and if it conflicts with another record
    if (noUrut && parseInt(noUrut) !== existingSurat.noUrut) {
      const conflictingSurat = await prisma.suratKeluar.findUnique({
        where: { noUrut: parseInt(noUrut) }
      })

      if (conflictingSurat) {
        return NextResponse.json(
          { error: 'Nomor urut sudah digunakan' },
          { status: 400 }
        )
      }
    }

    // Validate pengolah enum if provided
    if (pengolah && !Object.values(PengolahSurat).includes(pengolah)) {
      return NextResponse.json(
        { error: 'Pengolah tidak valid' },
        { status: 400 }
      )
    }

    // Update surat keluar
    const updatedSurat = await prisma.suratKeluar.update({
      where: { id },
      data: {
        ...(noUrut && { noUrut: parseInt(noUrut) }),
        ...(klas && { klas }),
        ...(pengolah && { pengolah }),
        ...(tanggalSurat && { tanggalSurat: new Date(tanggalSurat) }),
        ...(perihalSurat && { perihalSurat }),
        ...(kirimKepada && { kirimKepada }),
        suratMasukId: suratMasukId || null
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

    return NextResponse.json(updatedSurat)
  } catch (error) {
    console.error('Error updating surat keluar:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/surat-keluar/[id] - Delete surat keluar
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if surat keluar exists
    const existingSurat = await prisma.suratKeluar.findUnique({
      where: { id }
    })

    if (!existingSurat) {
      return NextResponse.json(
        { error: 'Surat keluar tidak ditemukan' },
        { status: 404 }
      )
    }

    // Delete surat keluar
    await prisma.suratKeluar.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Surat keluar berhasil dihapus' })
  } catch (error) {
    console.error('Error deleting surat keluar:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}