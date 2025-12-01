// API Route untuk dashboard stats yang lebih cepat
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get current month range
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)

    // Fetch all stats in parallel with optimized queries
    const [
      totalSuratMasuk,
      totalSuratKeluar,
      totalDisposisi,
      suratBulanIni,
      recentSurats
    ] = await Promise.all([
      // Count total surat masuk
      prisma.suratMasuk.count(),
      
      // Count total surat keluar
      prisma.suratKeluar.count(),
      
      // Count total disposisi
      prisma.disposisi.count(),
      
      // Count surat masuk this month
      prisma.suratMasuk.count({
        where: {
          tanggalSurat: {
            gte: startOfMonth,
            lt: endOfMonth
          }
        }
      }),
      
      // Get recent 5 surat masuk with minimal fields
      prisma.suratMasuk.findMany({
        select: {
          id: true,
          noUrut: true,
          nomorSurat: true,
          tanggalSurat: true,
          asalSurat: true,
          perihal: true
        },
        orderBy: { noUrut: 'desc' },
        take: 5
      })
    ])

    const disposisiPending = Math.max(0, totalSuratMasuk - totalDisposisi)

    return NextResponse.json({
      stats: {
        totalSurat: totalSuratMasuk,
        totalSuratKeluar,
        totalDisposisi,
        suratBulanIni,
        disposisiPending
      },
      recentSurats
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    )
  }
}
