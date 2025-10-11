import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function getSuratId() {
  try {
    const suratList = await prisma.suratMasuk.findMany({
      select: { id: true, nomorSurat: true },
      take: 3
    })
    
    console.log('📋 Daftar Surat Masuk:')
    suratList.forEach((surat, index) => {
      console.log(`${index + 1}. ID: ${surat.id}`)
      console.log(`   Nomor: ${surat.nomorSurat}`)
      console.log('')
    })
    
  } catch (error) {
    console.log('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

getSuratId()