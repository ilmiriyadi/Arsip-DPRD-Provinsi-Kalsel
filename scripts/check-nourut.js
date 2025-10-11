import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkNoUrut() {
  try {
    console.log("🔍 Checking noUrut data...")

    // Check surat masuk
    const suratMasuk = await prisma.suratMasuk.findMany({
      orderBy: { noUrut: 'asc' },
      select: { id: true, noUrut: true, nomorSurat: true }
    })

    console.log("\n📄 Surat Masuk:")
    suratMasuk.forEach(surat => {
      console.log(`  #${surat.noUrut} - ${surat.nomorSurat}`)
    })

    // Check disposisi
    const disposisi = await prisma.disposisi.findMany({
      orderBy: { noUrut: 'asc' },
      select: { 
        id: true, 
        noUrut: true, 
        nomorDisposisi: true,
        suratMasukId: true,
        suratMasuk: {
          select: { noUrut: true, nomorSurat: true }
        }
      }
    })

    console.log("\n📋 Disposisi:")
    disposisi.forEach(disp => {
      console.log(`  #${disp.noUrut} - ${disp.nomorDisposisi} (dari surat #${disp.suratMasuk.noUrut})`)
      
      // Check if disposisi noUrut matches surat masuk noUrut
      if (disp.noUrut !== disp.suratMasuk.noUrut) {
        console.log(`    ❌ MISMATCH! Disposisi noUrut ${disp.noUrut} != Surat Masuk noUrut ${disp.suratMasuk.noUrut}`)
      }
    })

    console.log("\n📊 Summary:")
    console.log(`Total Surat Masuk: ${suratMasuk.length}`)
    console.log(`Total Disposisi: ${disposisi.length}`)

  } catch (error) {
    console.error("❌ Error:", error)
  } finally {
    await prisma.$disconnect()
  }
}

checkNoUrut()