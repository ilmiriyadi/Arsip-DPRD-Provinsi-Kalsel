const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createSampleSuratMasuk() {
  try {
    console.log('Creating sample surat masuk...')
    
    // First, get an admin user
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })

    if (!adminUser) {
      console.log('No admin user found - creating admin user first')
      return
    }

    console.log('Found admin user:', adminUser.name || adminUser.email)

    // Check if there are existing surat masuk
    const existingSurat = await prisma.suratMasuk.count()
    console.log('Existing surat masuk count:', existingSurat)

    if (existingSurat < 3) {
      // Create sample surat masuk
      const sampleData = [
        {
          noUrut: 2001,
          nomorSurat: '001/DPRD/XI/2025',
          tanggalSurat: new Date('2025-11-01'),
          asalSurat: 'Gubernur Kalimantan Selatan',
          perihal: 'Undangan Rapat Koordinasi Pembangunan Daerah',
          keterangan: 'Rapat koordinasi pembangunan infrastruktur',
          createdById: adminUser.id
        },
        {
          noUrut: 2002,
          nomorSurat: '002/DISDIK/XI/2025',
          tanggalSurat: new Date('2025-11-02'),
          asalSurat: 'Dinas Pendidikan Kalsel',
          perihal: 'Laporan Evaluasi Program Pendidikan',
          keterangan: 'Evaluasi program pendidikan tahun 2025',
          createdById: adminUser.id
        },
        {
          noUrut: 2003,
          nomorSurat: '003/DINKES/XI/2025',
          tanggalSurat: new Date('2025-11-03'),
          asalSurat: 'Dinas Kesehatan Kalsel',
          perihal: 'Permohonan Bantuan Alat Kesehatan',
          keterangan: 'Bantuan alat kesehatan untuk puskesmas',
          createdById: adminUser.id
        }
      ]

      for (const surat of sampleData) {
        try {
          await prisma.suratMasuk.create({ data: surat })
          console.log(`✓ Created: ${surat.nomorSurat}`)
        } catch (err) {
          console.log(`⚠ Skipped: ${surat.nomorSurat} (already exists)`)
        }
      }
    } else {
      console.log('Sufficient surat masuk already exist')
    }

    // List all surat masuk
    const allSuratMasuk = await prisma.suratMasuk.findMany({
      include: {
        createdBy: {
          select: { name: true, email: true }
        }
      },
      orderBy: { noUrut: 'asc' }
    })

    console.log('\n📋 All surat masuk:')
    allSuratMasuk.forEach((surat, index) => {
      console.log(`${index + 1}. ${surat.nomorSurat}: ${surat.perihal}`)
      console.log(`   From: ${surat.asalSurat}`)
      console.log(`   Date: ${surat.tanggalSurat.toISOString().split('T')[0]}`)
      console.log(`   By: ${surat.createdBy.name || surat.createdBy.email}`)
      console.log('')
    })

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createSampleSuratMasuk()