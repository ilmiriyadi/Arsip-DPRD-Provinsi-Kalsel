import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function addTestSurat() {
  try {
    // Get admin user
    const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } })
    if (!admin) {
      console.log('❌ Admin user not found')
      return
    }

    // Create test surat masuk
    const surat = await prisma.suratMasuk.create({
      data: {
        nomorSurat: 'SM/TEST/003/X/2024',
        tanggalSurat: new Date('2024-10-10'),
        asalSurat: 'Dinas Lingkungan Hidup',
        perihal: 'Undangan rapat koordinasi pengelolaan sampah terpadu',
        keterangan: 'Rapat untuk membahas strategi pengelolaan sampah yang berkelanjutan',
        createdById: admin.id
      }
    })

    console.log('✅ Test surat masuk created:', surat.nomorSurat)
    
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('ℹ️ Test surat already exists')
    } else {
      console.log('❌ Error:', error.message)
    }
  } finally {
    await prisma.$disconnect()
  }
}

addTestSurat()