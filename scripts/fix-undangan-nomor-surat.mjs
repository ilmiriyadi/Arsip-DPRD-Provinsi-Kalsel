import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Load environment variables from .env.local
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: join(__dirname, '..', '.env.local') })

const prisma = new PrismaClient()

async function fixUndanganNomorSurat() {
  try {
    console.log('🔍 Mencari surat dengan nomorSurat yang mengandung "Undangan"...')
    
    // Cari semua surat dengan nomorSurat yang mengandung kata "Undangan"
    const suratWithUndangan = await prisma.suratMasuk.findMany({
      where: {
        nomorSurat: {
          contains: 'Undangan',
          mode: 'insensitive' // Case insensitive search
        }
      },
      select: {
        id: true,
        noUrut: true,
        nomorSurat: true,
        asalSurat: true,
      }
    })

    console.log(`📋 Ditemukan ${suratWithUndangan.length} surat dengan kata "Undangan" di nomorSurat`)

    if (suratWithUndangan.length === 0) {
      console.log('✅ Tidak ada data yang perlu diperbaiki')
      return
    }

    console.log('\n📊 Detail surat yang akan diupdate:')
    suratWithUndangan.forEach((surat, index) => {
      console.log(`  ${index + 1}. No Urut: ${surat.noUrut}`)
      console.log(`     Nomor Surat: "${surat.nomorSurat}"`)
      console.log(`     Asal Surat: ${surat.asalSurat}`)
      console.log(`     ID: ${surat.id}`)
      console.log('')
    })

    console.log('🔧 Mengubah nomorSurat menjadi NULL...')
    
    // Update semua surat yang mengandung "Undangan" menjadi null
    const result = await prisma.suratMasuk.updateMany({
      where: {
        nomorSurat: {
          contains: 'Undangan',
          mode: 'insensitive'
        }
      },
      data: {
        nomorSurat: null
      }
    })

    console.log(`✅ Berhasil mengupdate ${result.count} record`)

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixUndanganNomorSurat()
