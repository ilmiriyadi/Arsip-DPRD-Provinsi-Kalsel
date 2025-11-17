import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import * as XLSX from 'xlsx'

// GET - Export all surat masuk to Excel
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all surat masuk with related data
    const suratMasukList = await prisma.suratMasuk.findMany({
      include: {
        createdBy: {
          select: {
            name: true,
            email: true
          }
        },
        disposisi: {
          select: {
            id: true,
            tujuanDisposisi: true
          }
        }
      },
      orderBy: {
        noUrut: 'asc'
      }
    })

    // Prepare data for Excel
    const rows: Array<Array<string | number | Date>> = []
    
    // Header
    rows.push([
      'No Urut',
      'Nomor Surat',
      'Tanggal Surat',
      'Tanggal Diteruskan',
      'Asal Surat',
      'Perihal',
      'Keterangan',
      'Jumlah Disposisi',
      'Dibuat Oleh',
      'Tanggal Dibuat'
    ])

    let previousNoUrut: number | null = null

    for (const surat of suratMasukList) {
      // Add 3 empty rows when switching to a different surat (based on noUrut)
      if (previousNoUrut !== null && surat.noUrut !== previousNoUrut) {
        rows.push([])
        rows.push([])
        rows.push([])
      }

      previousNoUrut = surat.noUrut

      // Format tanggal
      const tanggalSurat = new Date(surat.tanggalSurat).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })

      const tanggalDiteruskan = new Date(surat.tanggalDiteruskan).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })

      const tanggalDibuat = new Date(surat.createdAt).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })

      rows.push([
        surat.noUrut,
        surat.nomorSurat || '-',
        tanggalSurat,
        tanggalDiteruskan,
        surat.asalSurat,
        surat.perihal,
        surat.keterangan || '-',
        surat.disposisi.length,
        surat.createdBy.name || surat.createdBy.email,
        tanggalDibuat
      ])
    }

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.aoa_to_sheet(rows)

    // Set column widths
    const columnWidths = [
      { wch: 10 },  // No Urut
      { wch: 20 },  // Nomor Surat
      { wch: 15 },  // Tanggal Surat
      { wch: 18 },  // Tanggal Diteruskan
      { wch: 30 },  // Asal Surat
      { wch: 50 },  // Perihal
      { wch: 30 },  // Keterangan
      { wch: 15 },  // Jumlah Disposisi
      { wch: 20 },  // Dibuat Oleh
      { wch: 18 }   // Tanggal Dibuat
    ]
    worksheet['!cols'] = columnWidths

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Surat Masuk')

    // Generate buffer
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

    // Create filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `Surat-Masuk-${timestamp}.xlsx`

    // Return file
    return new NextResponse(excelBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Error exporting surat masuk:', error)
    return NextResponse.json(
      { error: 'Gagal mengekspor data surat masuk' },
      { status: 500 }
    )
  }
}
