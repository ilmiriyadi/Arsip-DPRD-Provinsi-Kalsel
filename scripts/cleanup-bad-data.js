import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanupBadData() {
  try {
    console.log("🧹 Cleaning up data with incorrect noUrut...")

    // Delete disposisi with mismatched noUrut
    console.log("\n📋 Finding disposisi with mismatched noUrut...")
    
    const disposisiWithMismatch = await prisma.disposisi.findMany({
      include: {
        suratMasuk: {
          select: { noUrut: true, nomorSurat: true }
        }
      }
    })

    const toDelete = []
    disposisiWithMismatch.forEach(disp => {
      if (disp.noUrut !== disp.suratMasuk.noUrut) {
        toDelete.push(disp.id)
        console.log(`  ❌ Disposisi #${disp.noUrut} != Surat #${disp.suratMasuk.noUrut} (${disp.suratMasuk.nomorSurat})`)
      }
    })

    if (toDelete.length > 0) {
      console.log(`\n🗑️ Deleting ${toDelete.length} disposisi with wrong noUrut...`)
      await prisma.disposisi.deleteMany({
        where: { id: { in: toDelete } }
      })
      console.log("✅ Cleanup completed!")
    } else {
      console.log("✅ All disposisi have correct noUrut!")
    }

    // Show final count
    const finalSuratCount = await prisma.suratMasuk.count()
    const finalDisposisiCount = await prisma.disposisi.count()
    
    console.log(`\n📊 Final counts:`)
    console.log(`Surat Masuk: ${finalSuratCount}`)
    console.log(`Disposisi: ${finalDisposisiCount}`)

  } catch (error) {
    console.error("❌ Error during cleanup:", error)
  } finally {
    await prisma.$disconnect()
  }
}

cleanupBadData()