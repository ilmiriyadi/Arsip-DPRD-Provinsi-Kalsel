const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed script — creating sample data for all surat types...')

  // 1) Ensure admin user exists
  const adminEmail = 'admin@local.test'
  let admin = await prisma.user.findUnique({ where: { email: adminEmail } })
  if (!admin) {
    const hashed = await bcrypt.hash('password', 10)
    admin = await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'Admin Sample',
        password: hashed,
        role: 'ADMIN'
      }
    })
    console.log('✓ Created admin user:', admin.email)
  } else {
    console.log('✓ Admin user already exists:', admin.email)
  }

  // 2) Ensure a regular user exists
  const userEmail = 'user@local.test'
  let user = await prisma.user.findUnique({ where: { email: userEmail } })
  if (!user) {
    const hashed = await bcrypt.hash('password', 10)
    user = await prisma.user.create({
      data: {
        email: userEmail,
        name: 'User Sample',
        password: hashed,
        role: 'MEMBER'
      }
    })
    console.log('✓ Created regular user:', user.email)
  } else {
    console.log('✓ Regular user already exists:', user.email)
  }

  // 3) Create sample SuratMasuk (if not enough)
  const suratMasukCount = await prisma.suratMasuk.count()
  if (suratMasukCount < 5) {
    const sampleSuratMasuk = [
      {
        noUrut: 1001,
        nomorSurat: 'SM-2025-1001',
        tanggalSurat: new Date('2025-11-01'),
        tanggalDiteruskan: new Date('2025-11-02'),
        asalSurat: 'Sekretariat Daerah',
        perihal: 'Undangan Rapat Penyusunan RAPBD',
        keterangan: 'Penting',
        createdById: admin.id
      },
      {
        noUrut: 1002,
        nomorSurat: 'SM-2025-1002',
        tanggalSurat: new Date('2025-11-03'),
        tanggalDiteruskan: new Date('2025-11-04'),
        asalSurat: 'Dinas Pekerjaan Umum',
        perihal: 'Laporan Proyek Jalan',
        keterangan: 'Untuk diproses',
        createdById: admin.id
      },
      {
        noUrut: 1003,
        nomorSurat: 'SM-2025-1003',
        tanggalSurat: new Date('2025-11-05'),
        tanggalDiteruskan: new Date('2025-11-06'),
        asalSurat: 'Bappeda',
        perihal: 'Usulan Program Pembangunan',
        keterangan: '',
        createdById: user.id
      }
    ]

    for (const s of sampleSuratMasuk) {
      try {
        await prisma.suratMasuk.create({ data: s })
        console.log('✓ Created surat masuk', s.nomorSurat)
      } catch (err) {
        console.log('⚠ Skipped surat masuk (exists?):', s.nomorSurat)
      }
    }
  } else {
    console.log('✓ Sufficient surat_masuk already exists:', suratMasukCount)
  }

  // 4) Create sample SuratKeluar linked to some SuratMasuk
  const suratKeluarCount = await prisma.suratKeluar.count()
  const suratMasukList = await prisma.suratMasuk.findMany({ take: 3, orderBy: { noUrut: 'asc' } })

  if (suratKeluarCount < 3 && suratMasukList.length > 0) {
    const sampleSuratKeluar = [
      {
        noUrut: 3001,
        klas: 'B',
        pengolah: 'SEKWAN',
        tanggalSurat: new Date('2025-11-07'),
        perihalSurat: 'Balasan Undangan RAPBD',
        kirimKepada: 'Gubernur Kalimantan Selatan',
        suratMasukId: suratMasukList[0].id,
        createdById: admin.id
      },
      {
        noUrut: 3002,
        klas: 'C',
        pengolah: 'KETUA_DPRD',
        tanggalSurat: new Date('2025-11-08'),
        perihalSurat: 'Pemberitahuan Rapat',
        kirimKepada: 'Dinas Pendidikan Kalsel',
        suratMasukId: suratMasukList[1]?.id || null,
        createdById: admin.id
      }
    ]

    for (const sk of sampleSuratKeluar) {
      try {
        await prisma.suratKeluar.create({ data: sk })
        console.log('✓ Created surat keluar', sk.noUrut)
      } catch (err) {
        console.log('⚠ Skipped surat keluar (exists?):', sk.noUrut)
      }
    }
  } else {
    console.log('✓ Sufficient surat_keluar already exists or no surat_masuk available')
  }

  // 5) Create sample Disposisi linked to surat_masuk
  const disposisiCount = await prisma.disposisi.count()
  if (disposisiCount < 3 && suratMasukList.length > 0) {
    const sampleDisposisi = [
      {
        noUrut: 4001,
        nomorDisposisi: 'D-2025-4001',
        tanggalDisposisi: new Date('2025-11-02'),
        tujuanDisposisi: 'Bappeda',
        isiDisposisi: 'Tindak lanjut usulan program',
        keterangan: 'Segera ditindaklanjuti',
        status: 'SELESAI',
        suratMasukId: suratMasukList[0].id,
        createdById: admin.id
      },
      {
        noUrut: 4002,
        nomorDisposisi: 'D-2025-4002',
        tanggalDisposisi: new Date('2025-11-04'),
        tujuanDisposisi: 'Dinas Kesehatan',
        isiDisposisi: 'Periksa anggaran',
        keterangan: '',
        status: 'SELESAI',
        suratMasukId: suratMasukList[1].id,
        createdById: admin.id
      }
    ]

    for (const d of sampleDisposisi) {
      try {
        await prisma.disposisi.create({ data: d })
        console.log('✓ Created disposisi', d.nomorDisposisi)
      } catch (err) {
        console.log('⚠ Skipped disposisi (exists?):', d.nomorDisposi)
      }
    }
  } else {
    console.log('✓ Sufficient disposisi already exists or no surat_masuk available')
  }

  // 6) Create sample SuratTamu
  const suratTamuCount = await prisma.suratTamu.count()
  if (suratTamuCount < 5) {
    const sampleTamu = [
      {
        noUrut: 5001,
        nama: 'Sdr. Ahmad',
        keperluan: 'Permohonan Audiensi',
        asalSurat: 'Masyarakat Kabupaten X',
        tujuanSurat: 'Ketua DPRD',
        nomorTelpon: '081234567890',
        tanggal: new Date('2025-11-06T09:30:00'),
        createdById: admin.id
      },
      {
        noUrut: 5002,
        nama: 'Ibu Sari',
        keperluan: 'Pelaporan Aspirasi',
        asalSurat: 'LSM Y',
        tujuanSurat: 'Komisi A',
        nomorTelpon: '082345678901',
        tanggal: new Date('2025-11-06T10:00:00'),
        createdById: user.id
      }
    ]

    for (const t of sampleTamu) {
      try {
        await prisma.suratTamu.create({ data: t })
        console.log('✓ Created surat tamu', t.nama)
      } catch (err) {
        console.log('⚠ Skipped surat tamu (exists?):', t.nama)
      }
    }
  } else {
    console.log('✓ Sufficient surat_tamu already exists:', suratTamuCount)
  }

  // Final counts
  const counts = {
    users: await prisma.user.count(),
    suratMasuk: await prisma.suratMasuk.count(),
    suratKeluar: await prisma.suratKeluar.count(),
    disposisi: await prisma.disposisi.count(),
    suratTamu: await prisma.suratTamu.count()
  }

  console.log('\nSeed complete — model counts:')
  console.log(counts)
}

main()
  .catch((e) => {
    console.error('Seed failed:', e)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
