import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// POST - Copy surat masuk to disposisi
export async function POST(
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
    const { tujuanDisposisi } = body

    // Validate tujuan disposisi
    if (!tujuanDisposisi || !tujuanDisposisi.trim()) {
      return NextResponse.json(
        { error: "Tujuan disposisi wajib diisi" },
        { status: 400 }
      )
    }

    // Get surat masuk data
    const surat = await prisma.suratMasuk.findUnique({
      where: { id }
    })

    if (!surat) {
      return NextResponse.json(
        { error: "Surat masuk tidak ditemukan" },
        { status: 404 }
      )
    }

    const today = new Date()
    
    // Generate nomorDisposisi otomatis: DISP/SM{noUrut}/DSP/MM/YYYY
    const bulan = (today.getMonth() + 1).toString().padStart(2, '0')
    const tahun = today.getFullYear()
    const nomorDisposisi = `DISP/SM${surat.noUrut.toString().padStart(3, '0')}/DSP/${bulan}/${tahun}`

    // Create disposisi with noUrut sama dengan surat masuk
    const disposisi = await prisma.disposisi.create({
      data: {
        noUrut: surat.noUrut, // noUrut disposisi SAMA dengan surat masuk
        nomorDisposisi: nomorDisposisi,
        tanggalDisposisi: today,
        tujuanDisposisi: tujuanDisposisi.trim(),
        isiDisposisi: `Disposisi untuk surat nomor ${surat.nomorSurat} dengan perihal "${surat.perihal}" dari ${surat.asalSurat}. Mohon untuk ditindaklanjuti sesuai dengan ketentuan yang berlaku.`,
        keterangan: `Auto-generated dari surat masuk ${surat.nomorSurat} ke ${tujuanDisposisi.trim()}`,
        status: 'SELESAI',
        suratMasukId: id,
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
            perihal: true,
            asalSurat: true
          }
        }
      }
    })

    return NextResponse.json({
      message: "Disposisi berhasil dibuat dari surat masuk",
      disposisi
    }, { status: 201 })
  } catch (error) {
    console.error("Error copying surat to disposisi:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    )
  }
}