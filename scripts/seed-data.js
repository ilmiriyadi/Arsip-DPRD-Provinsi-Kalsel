import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedData() {
  try {
    // Find admin user
    const admin = await prisma.user.findFirst({
      where: { email: 'ilmiriyadi@gmail.com' }
    })

    if (!admin) {
      console.log('❌ Admin user not found. Please create admin first.')
      return
    }

    // Create sample surat masuk dengan noUrut MANUAL
    const surat1 = await prisma.suratMasuk.create({
      data: {
        noUrut: 100, // Manual noUrut
        nomorSurat: 'SM/001/X/2024',
        tanggalSurat: new Date('2024-10-01'),
        asalSurat: 'Kementerian Pendidikan',
        perihal: 'Permohonan Kerjasama Program Magang',
        keterangan: 'Surat permohonan kerjasama untuk program magang mahasiswa',
        createdById: admin.id
      }
    })

    const surat2 = await prisma.suratMasuk.create({
      data: {
        noUrut: 101, // Manual noUrut
        nomorSurat: 'SM/002/X/2024',
        tanggalSurat: new Date('2024-10-02'),
        asalSurat: 'PT. Teknologi Nusantara',
        perihal: 'Proposal Pengembangan Sistem Informasi',
        keterangan: 'Proposal penawaran pengembangan sistem informasi akademik',
        createdById: admin.id
      }
    })

    const surat3 = await prisma.suratMasuk.create({
      data: {
        noUrut: 102, // Manual noUrut
        nomorSurat: 'SM/003/X/2024',
        tanggalSurat: new Date('2024-10-03'),
        asalSurat: 'Dinas Pendidikan Kota',
        perihal: 'Undangan Rapat Koordinasi',
        keterangan: 'Undangan menghadiri rapat koordinasi program pendidikan',
        createdById: admin.id
      }
    })

    // Create sample disposisi dengan noUrut SAMA dengan surat masuk
    await prisma.disposisi.create({
      data: {
        noUrut: 100, // SAMA dengan surat masuk noUrut
        nomorDisposisi: 'DISP/SM100/DSP/10/2024',
        tanggalDisposisi: new Date('2024-10-02'),
        tujuanDisposisi: 'Kepala Bagian Akademik',
        isiDisposisi: 'Mohon koordinasi dengan bagian kemahasiswaan untuk menindaklanjuti permohonan kerjasama program magang ini.',
        keterangan: 'Prioritas tinggi untuk segera ditindaklanjuti',
        status: 'SELESAI',
        suratMasukId: surat1.id,
        createdById: admin.id
      }
    })

    await prisma.disposisi.create({
      data: {
        noUrut: 101, // SAMA dengan surat masuk noUrut
        nomorDisposisi: 'DISP/SM101/DSP/10/2024',
        tanggalDisposisi: new Date('2024-10-03'),
        tujuanDisposisi: 'Kepala Bagian IT',
        isiDisposisi: 'Mohon review proposal dan berikan evaluasi teknis serta estimasi budget.',
        keterangan: 'Jadwalkan meeting dengan vendor dalam 1 minggu',
        status: 'SELESAI',
        suratMasukId: surat2.id,
        createdById: admin.id
      }
    })

    await prisma.disposisi.create({
      data: {
        noUrut: 102, // SAMA dengan surat masuk noUrut
        nomorDisposisi: 'DISP/SM102/DSP/10/2024',
        tanggalDisposisi: new Date('2024-10-04'),
        tujuanDisposisi: 'Wakil Rektor I',
        isiDisposisi: 'Harap hadiri rapat koordinasi dan sampaikan posisi institusi terkait program pendidikan.',
        status: 'SELESAI',
        suratMasukId: surat3.id,
        createdById: admin.id
      }
    })

    console.log('✅ Sample data berhasil ditambahkan!')
    console.log('📨 3 Surat Masuk dan 3 Disposisi telah dibuat')
    console.log('🔗 Data surat masuk dan disposisi sudah terhubung')

  } catch (error) {
    console.error('❌ Error creating sample data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedData()