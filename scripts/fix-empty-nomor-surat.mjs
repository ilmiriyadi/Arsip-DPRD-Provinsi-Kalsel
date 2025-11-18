import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Load environment variables from .env.local
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: join(__dirname, '..', '.env.local') })

const prisma = new PrismaClient()

async function fixEmptyNomorSurat() {
  try {
    console.log('🔍 Mencari surat dengan nomorSurat kosong...')
    
    // Cari semua surat dengan nomorSurat empty string
    const suratWithEmptyNomor = await prisma.suratMasuk.findMany({
      where: {
        nomorSurat: ''
      },
      select: {
        id: true,
        noUrut: true,
        nomorSurat: true,
      }
    })

    console.log(`📋 Ditemukan ${suratWithEmptyNomor.length} surat dengan nomorSurat kosong`)

    if (suratWithEmptyNomor.length === 0) {
      console.log('✅ Tidak ada data yang perlu diperbaiki')
      return
    }

    console.log('\n🔧 Mengubah nomorSurat kosong menjadi NULL...')
    
    // Update semua surat dengan nomorSurat empty string menjadi null
    const result = await prisma.suratMasuk.updateMany({
      where: {
        nomorSurat: ''
      },
      data: {
        nomorSurat: null
      }
    })

    console.log(`✅ Berhasil mengupdate ${result.count} record`)
    console.log('\n📊 Detail surat yang diupdate:')
    suratWithEmptyNomor.forEach((surat, index) => {
      console.log(`  ${index + 1}. No Urut: ${surat.noUrut} (ID: ${surat.id})`)
    })

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixEmptyNomorSurat()
