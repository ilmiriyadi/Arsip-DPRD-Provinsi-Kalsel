import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Generate nomor surat unik berdasarkan timestamp
const timestamp = Date.now().toString().slice(-6) // 6 digit terakhir timestamp

const dummySuratMasuk = [
  {
    nomorSurat: `${timestamp}/DPRD/X/2025`,
    tanggalSurat: new Date("2025-10-01"),
    asalSurat: "Kantor Gubernur Jawa Barat", 
    perihal: "Undangan Rapat Koordinasi Pembangunan Daerah",
    keterangan: "Rapat koordinasi pembangunan infrastruktur daerah untuk tahun 2026"
  },
  {
    nomorSurat: `${parseInt(timestamp) + 1}/PEMDA/X/2025`, 
    tanggalSurat: new Date("2025-10-02"),
    asalSurat: "Dinas Pendidikan Kabupaten",
    perihal: "Laporan Kinerja Pendidikan Semester I Tahun 2025",
    keterangan: "Laporan capaian target pendidikan dan usulan program semester II"
  },
  {
    nomorSurat: `${parseInt(timestamp) + 2}/KOMINFO/X/2025`,
    tanggalSurat: new Date("2025-10-03"), 
    asalSurat: "Kementerian Komunikasi dan Informatika",
    perihal: "Sosialisasi Program Digitalisasi Pelayanan Publik",
    keterangan: "Program transformasi digital untuk meningkatkan pelayanan publik"
  },
  {
    nomorSurat: `${parseInt(timestamp) + 3}/KESRA/X/2025`,
    tanggalSurat: new Date("2025-10-05"),
    asalSurat: "Dinas Kesehatan Provinsi", 
    perihal: "Pemberitahuan Vaksinasi Massal COVID-19 Booster",
    keterangan: "Koordinasi pelaksanaan vaksinasi booster untuk masyarakat umum"
  },
  {
    nomorSurat: `${parseInt(timestamp) + 4}/BAPPEDA/X/2025`,
    tanggalSurat: new Date("2025-10-07"),
    asalSurat: "Badan Perencanaan Pembangunan Daerah",
    perihal: "Usulan Anggaran Pembangunan Tahun 2026", 
    keterangan: "Proposal alokasi dana pembangunan infrastruktur dan program sosial"
  },
  {
    nomorSurat: `${parseInt(timestamp) + 5}/DPUPR/X/2025`,
    tanggalSurat: new Date("2025-10-08"),
    asalSurat: "Dinas Pekerjaan Umum dan Perumahan Rakyat",
    perihal: "Laporan Progress Pembangunan Jalan Tol Bandung-Garut",
    keterangan: "Update kemajuan konstruksi dan kendala teknis yang dihadapi"
  },
  {
    nomorSurat: `${parseInt(timestamp) + 6}/POLDA/X/2025`, 
    tanggalSurat: new Date("2025-10-09"),
    asalSurat: "Kepolisian Daerah Jawa Barat",
    perihal: "Koordinasi Pengamanan Event HUT Kemerdekaan RI",
    keterangan: "Rencana pengamanan dan dukungan personil untuk acara peringatan kemerdekaan"
  },
  {
    nomorSurat: `${parseInt(timestamp) + 7}/DISPAR/X/2025`,
    tanggalSurat: new Date("2025-10-10"),
    asalSurat: "Dinas Pariwisata Kabupaten",
    perihal: "Proposal Festival Budaya dan Kuliner Nusantara 2025",
    keterangan: "Rencana penyelenggaraan festival untuk mempromosikan wisata lokal"
  },
  {
    nomorSurat: `${parseInt(timestamp) + 8}/DISHUB/X/2025`,
    tanggalSurat: new Date("2025-10-11"),
    asalSurat: "Dinas Perhubungan Provinsi",
    perihal: "Evaluasi Sistem Transportasi Umum Jakarta-Bandung",
    keterangan: "Laporan evaluasi dan rekomendasi perbaikan sistem transportasi publik"
  },
  {
    nomorSurat: `${parseInt(timestamp) + 9}/KEMENDAGRI/X/2025`,
    tanggalSurat: new Date("2025-10-12"),
    asalSurat: "Kementerian Dalam Negeri RI",
    perihal: "Instruksi Pembentukan Tim Percepatan Reformasi Birokrasi",
    keterangan: "Pembentukan tim khusus untuk mempercepat proses reformasi birokrasi daerah"
  }
]

const tujuanDisposisi = [
  "Pimpinan DPRD",
  "SEKWAN", 
  "RTA",
  "Persidangan",
  "Keuangan",
  "Fraksi"
]

async function seedData() {
  try {
    console.log("🌱 Mulai seeding data dummy...")

    // Cari admin user
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })

    if (!adminUser) {
      console.error("❌ Admin user tidak ditemukan! Jalankan create-admin.js terlebih dahulu.")
      return
    }

    console.log(`👤 Menggunakan admin user: ${adminUser.email}`)

    // Manual noUrut assignment - sesuai permintaan user bahwa noUrut harus ketik manual
    const manualNoUrut = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] // 10 nomor urut manual

    console.log(`📄 Membuat ${dummySuratMasuk.length} surat masuk dummy dengan noUrut manual...`)

    for (let i = 0; i < dummySuratMasuk.length; i++) {
      const suratData = dummySuratMasuk[i]
      const noUrut = manualNoUrut[i] // Ambil noUrut manual
      
      // Cek apakah noUrut sudah ada
      const existingSurat = await prisma.suratMasuk.findFirst({
        where: { noUrut }
      })
      
      if (existingSurat) {
        console.log(`⚠️ Surat dengan noUrut ${noUrut} sudah ada, skip...`)
        continue
      }
      
      // Buat surat masuk dengan noUrut manual
      const surat = await prisma.suratMasuk.create({
        data: {
          ...suratData,
          noUrut: noUrut, // Manual noUrut
          createdById: adminUser.id
        }
      })

      console.log(`✅ Surat masuk #${surat.noUrut} - ${surat.nomorSurat}`)

      // Random: 70% kemungkinan ada disposisi
      if (Math.random() > 0.3) {
        const randomTujuan = tujuanDisposisi[Math.floor(Math.random() * tujuanDisposisi.length)]
        const tanggalDisposisi = new Date(surat.tanggalSurat.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000)
        
        // Generate nomorDisposisi otomatis: DISP/SM{noUrut}/DSP/MM/YYYY  
        const bulan = (tanggalDisposisi.getMonth() + 1).toString().padStart(2, '0')
        const tahun = tanggalDisposisi.getFullYear()
        const nomorDisposisi = `DISP/SM${surat.noUrut.toString().padStart(3, '0')}/DSP/${bulan}/${tahun}`
        
        const disposisi = await prisma.disposisi.create({
          data: {
            noUrut: surat.noUrut, // NoUrut disposisi SAMA dengan noUrut surat masuk
            nomorDisposisi: nomorDisposisi,
            tanggalDisposisi: tanggalDisposisi,
            tujuanDisposisi: randomTujuan,
            isiDisposisi: `Disposisi untuk surat nomor ${surat.nomorSurat} dengan perihal "${surat.perihal}" dari ${surat.asalSurat}. Mohon untuk ditindaklanjuti sesuai dengan ketentuan yang berlaku.`,
            keterangan: `Auto-generated dari surat masuk ${surat.nomorSurat} ke ${randomTujuan}`,
            status: 'SELESAI',
            suratMasukId: surat.id,
            createdById: adminUser.id
          }
        })

        console.log(`  📋 Disposisi #${disposisi.noUrut} ke ${randomTujuan} (noUrut sama dengan surat masuk)`)
      }
    }

    console.log("\n🎉 Seeding data dummy berhasil!")
    
    // Tampilkan summary
    const totalSurat = await prisma.suratMasuk.count()
    const totalDisposisi = await prisma.disposisi.count()
    
    console.log(`📊 Total surat masuk: ${totalSurat}`)
    console.log(`📊 Total disposisi: ${totalDisposisi}`)
    console.log("\n✅ Silakan refresh aplikasi untuk melihat data dummy!")

  } catch (error) {
    console.error("❌ Error saat seeding:", error)
  } finally {
    await prisma.$disconnect()
  }
}

seedData()