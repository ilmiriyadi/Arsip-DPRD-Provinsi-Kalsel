import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const suratMasukSchema = z.object({
  nomorSurat: z.string().min(1, "Nomor surat wajib diisi"),
  tanggalSurat: z.string().datetime(),
  tanggalDiteruskan: z.string().datetime(),
  asalSurat: z.string().min(1, "Asal surat wajib diisi"),
  perihal: z.string().min(1, "Perihal wajib diisi"),
  keterangan: z.string().optional(),
  filePath: z.string().optional(),
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
    const suratMasuk = await prisma.suratMasuk.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        disposisi: {
          include: {
            createdBy: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            }
          },
          orderBy: { createdAt: "desc" }
        }
      }
    })

    if (!suratMasuk) {
      return NextResponse.json(
        { error: "Surat tidak ditemukan" },
        { status: 404 }
      )
    }

    return NextResponse.json(suratMasuk)
  } catch (error) {
    console.error("Error fetching surat masuk:", error)
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
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id } = await params
    const body = await req.json()
    const data = suratMasukSchema.parse(body)

    const updatedSurat = await prisma.suratMasuk.update({
      where: { id },
      data: {
        ...data,
        tanggalSurat: new Date(data.tanggalSurat),
        tanggalDiteruskan: new Date(data.tanggalDiteruskan),
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

    return NextResponse.json(updatedSurat)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    // Handle unique constraint error
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json(
        { error: "Nomor surat sudah ada, gunakan nomor yang berbeda" },
        { status: 400 }
      )
    }
    
    console.error("Error updating surat masuk:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id } = await params
    await prisma.suratMasuk.delete({
      where: { id }
    })

    return NextResponse.json({ message: "Surat berhasil dihapus" })
  } catch (error) {
    console.error("Error deleting surat masuk:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    )
  }
}