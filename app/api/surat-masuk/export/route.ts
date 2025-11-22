import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import ExcelJS from 'exceljs'

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
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Surat Masuk')

    // Add rows
    worksheet.addRows(rows)

    // Set column widths
    worksheet.columns = [
      { width: 10 },  // No Urut
      { width: 20 },  // Nomor Surat
      { width: 15 },  // Tanggal Surat
      { width: 18 },  // Tanggal Diteruskan
      { width: 30 },  // Asal Surat
      { width: 50 },  // Perihal
      { width: 30 },  // Keterangan
      { width: 15 },  // Jumlah Disposisi
      { width: 20 },  // Dibuat Oleh
      { width: 18 }   // Tanggal Dibuat
    ]

    // Style header row
    worksheet.getRow(1).font = { bold: true }
    worksheet.getRow(1).alignment = { horizontal: 'center', vertical: 'middle' }

    // Generate buffer
    const excelBuffer = await workbook.xlsx.writeBuffer()

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
