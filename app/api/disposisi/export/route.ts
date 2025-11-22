import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import ExcelJS from 'exceljs'

// GET - Export all disposisi to Excel with 3 blank rows between different surat
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all disposisi with related surat masuk data, grouped by surat
    const disposisiList = await prisma.disposisi.findMany({
      include: {
        suratMasuk: {
          select: {
            noUrut: true,
            nomorSurat: true,
            tanggalSurat: true,
            perihal: true,
            asalSurat: true
          }
        }
      },
      orderBy: [
        { noUrut: 'asc' },
        { tanggalDisposisi: 'asc' }
      ]
    })

    // Prepare data dengan pemisah 3 baris untuk setiap surat yang berbeda
    const rows: Array<Array<string | number | Date>> = []
    
    // Header
    rows.push([
      'Nomor',
      'Nomor Surat', 
      'Hari/Tanggal',
      'Hal',
      'Asal Surat',
      'Disposisi Surat',
      'Tanggal Disposisi'
    ])

    let lastNoUrut: number | null = null

    for (const disposisi of disposisiList) {
      // Jika nomor urut berubah (surat berbeda), tambahkan 3 baris kosong
      if (lastNoUrut !== null && disposisi.noUrut !== lastNoUrut) {
        rows.push([])
        rows.push([])
        rows.push([])
      }

      // Format tanggal sesuai format Indonesia
      const tanggalSurat = new Date(disposisi.suratMasuk.tanggalSurat).toLocaleDateString('id-ID', {
        weekday: 'long',
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric'
      })

      const tanggalDisposisi = new Date(disposisi.tanggalDisposisi).toLocaleDateString('id-ID', {
        weekday: 'long',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })

      rows.push([
        disposisi.noUrut,
        disposisi.suratMasuk.nomorSurat || '-',
        tanggalSurat,
        disposisi.suratMasuk.perihal,
        disposisi.suratMasuk.asalSurat,
        disposisi.tujuanDisposisi,
        tanggalDisposisi
      ])

      lastNoUrut = disposisi.noUrut
    }

    // Create workbook and worksheet
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Disposisi')

    // Add rows
    worksheet.addRows(rows)

    // Set column widths
    worksheet.columns = [
      { width: 8 },   // Nomor
      { width: 20 },  // Nomor Surat
      { width: 18 },  // Hari/Tanggal
      { width: 50 },  // Hal (lebih lebar untuk perihal panjang)
      { width: 20 },  // Asal Surat
      { width: 15 },  // Disposisi Surat
      { width: 18 }   // Tanggal Disposisi
    ]

    // Style header row
    worksheet.getRow(1).font = { bold: true }
    worksheet.getRow(1).alignment = { horizontal: 'center', vertical: 'middle' }

    // Generate Excel buffer
    const excelBuffer = await workbook.xlsx.writeBuffer()

    // Create filename with current date
    const currentDate = new Date().toLocaleDateString('id-ID').replace(/\//g, '-')
    const filename = `Disposisi_DPRD_Kalsel_${currentDate}.xlsx`

    // Return Excel file
    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': Buffer.byteLength(excelBuffer).toString()
      }
    })

  } catch (error) {
    console.error("Export error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}