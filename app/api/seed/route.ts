import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Security check - hanya bisa dijalankan di development atau dengan secret key
    const { searchParams } = new URL(request.url);
    const secretKey = searchParams.get('key');
    
    if (process.env.NODE_ENV === 'production' && secretKey !== process.env.SEEDER_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🚀 Starting to seed dummy data...');

    // Pastikan ada admin user
    let adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (!adminUser) {
      console.log('📝 Creating admin user...');
      const hashedPassword = await hash('admin123', 12);
      adminUser = await prisma.user.create({
        data: {
          email: 'admin@dprd-kalsel.gov.id',
          name: 'Administrator DPRD Kalsel',
          password: hashedPassword,
          role: 'ADMIN'
        }
      });
      console.log('✅ Admin user created');
    }

    // Data dummy untuk surat masuk
    const dummySuratMasuk = [
      {
        noUrut: 1,
        nomorSurat: '001/DPRD/2024',
        asalSurat: 'Gubernur Kalimantan Selatan',
        perihal: 'Undangan Rapat Koordinasi Pembangunan Daerah',
        keterangan: 'Rapat koordinasi untuk membahas program pembangunan tahun 2024'
      },
      {
        noUrut: 2,
        nomorSurat: '002/DPRD/2024',
        asalSurat: 'Bupati Banjarmasin',
        perihal: 'Permohonan Dukungan Anggaran Infrastruktur',
        keterangan: 'Permintaan dukungan untuk pembangunan jalan dan jembatan'
      },
      {
        noUrut: 3,
        nomorSurat: '003/DPRD/2024',
        asalSurat: 'Dinas Pendidikan Provinsi',
        perihal: 'Laporan Pelaksanaan Program Pendidikan Gratis',
        keterangan: 'Laporan evaluasi program pendidikan gratis selama semester I'
      },
      {
        noUrut: 4,
        nomorSurat: '004/DPRD/2024',
        asalSurat: 'Dinas Kesehatan Provinsi',
        perihal: 'Usulan Penambahan Fasilitas Kesehatan',
        keterangan: 'Proposal penambahan puskesmas dan rumah sakit daerah'
      },
      {
        noUrut: 5,
        nomorSurat: '005/DPRD/2024',
        asalSurat: 'Kapolda Kalimantan Selatan',
        perihal: 'Kerjasama Keamanan dan Ketertiban Masyarakat',
        keterangan: 'Usulan kerjasama dalam menjaga keamanan dan ketertiban'
      },
      {
        noUrut: 6,
        nomorSurat: '006/DPRD/2024',
        asalSurat: 'Dinas Perhubungan',
        perihal: 'Rencana Pembangunan Terminal Baru',
        keterangan: 'Rencana pembangunan terminal penumpang di kabupaten/kota'
      },
      {
        noUrut: 7,
        nomorSurat: '007/DPRD/2024',
        asalSurat: 'Bupati Hulu Sungai Selatan',
        perihal: 'Permohonan Bantuan Penanganan Bencana Alam',
        keterangan: 'Bantuan untuk korban banjir dan tanah longsor'
      },
      {
        noUrut: 8,
        nomorSurat: '008/DPRD/2024',
        asalSurat: 'Dinas Pertanian',
        perihal: 'Program Peningkatan Produktivitas Padi',
        keterangan: 'Usulan program bantuan benih dan pupuk untuk petani'
      },
      {
        noUrut: 9,
        nomorSurat: '009/DPRD/2024',
        asalSurat: 'Dinas Perikanan dan Kelautan',
        perihal: 'Pengembangan Sektor Perikanan Tambak',
        keterangan: 'Program pengembangan budidaya ikan dan udang'
      },
      {
        noUrut: 10,
        nomorSurat: '010/DPRD/2024',
        asalSurat: 'Walikota Banjarbaru',
        perihal: 'Rencana Pembangunan Smart City',
        keterangan: 'Proposal implementasi teknologi smart city'
      },
      {
        noUrut: 11,
        nomorSurat: '011/DPRD/2024',
        asalSurat: 'Dinas Pariwisata',
        perihal: 'Promosi Wisata Kalimantan Selatan',
        keterangan: 'Program promosi destinasi wisata unggulan daerah'
      },
      {
        noUrut: 12,
        nomorSurat: '012/DPRD/2024',
        asalSurat: 'Bupati Kotabaru',
        perihal: 'Pengembangan Kawasan Ekonomi Khusus',
        keterangan: 'Usulan pengembangan KEK di wilayah pesisir'
      },
      {
        noUrut: 13,
        nomorSurat: '013/DPRD/2024',
        asalSurat: 'Dinas Lingkungan Hidup',
        perihal: 'Program Rehabilitasi Hutan Mangrove',
        keterangan: 'Kegiatan penanaman dan konservasi hutan mangrove'
      },
      {
        noUrut: 14,
        nomorSurat: '014/DPRD/2024',
        asalSurat: 'Dinas Sosial',
        perihal: 'Bantuan Sosial untuk Lansia dan Disabilitas',
        keterangan: 'Program bantuan sosial dan rehabilitasi sosial'
      },
      {
        noUrut: 15,
        nomorSurat: '015/DPRD/2024',
        asalSurat: 'Bupati Barito Kuala',
        perihal: 'Revitalisasi Pasar Tradisional',
        keterangan: 'Rencana renovasi dan modernisasi pasar tradisional'
      },
      {
        noUrut: 16,
        nomorSurat: '016/DPRD/2024',
        asalSurat: 'Dinas Koperasi dan UKM',
        perihal: 'Pemberdayaan UMKM Lokal',
        keterangan: 'Program pelatihan dan bantuan modal untuk UMKM'
      },
      {
        noUrut: 17,
        nomorSurat: '017/DPRD/2024',
        asalSurat: 'Dinas Tenaga Kerja',
        perihal: 'Program Pelatihan Kerja Pemuda',
        keterangan: 'Pelatihan keterampilan untuk mengurangi pengangguran'
      },
      {
        noUrut: 18,
        nomorSurat: '018/DPRD/2024',
        asalSurat: 'Bupati Tanah Laut',
        perihal: 'Pengembangan Sektor Pertambangan Berkelanjutan',
        keterangan: 'Regulasi dan pengawasan kegiatan pertambangan'
      },
      {
        noUrut: 19,
        nomorSurat: '019/DPRD/2024',
        asalSurat: 'Dinas Komunikasi dan Informatika',
        perihal: 'Digitalisasi Layanan Publik',
        keterangan: 'Implementasi sistem pelayanan publik digital'
      },
      {
        noUrut: 20,
        nomorSurat: '020/DPRD/2024',
        asalSurat: 'Dinas Perumahan dan Permukiman',
        perihal: 'Program Perumahan Rakyat Sederhana',
        keterangan: 'Bantuan perumahan untuk masyarakat berpenghasilan rendah'
      }
    ];

    console.log('📄 Creating 20 dummy surat masuk...');
    
    const createdSuratMasuk = [];
    for (const surat of dummySuratMasuk) {
      try {
        const created = await prisma.suratMasuk.create({
          data: {
            noUrut: surat.noUrut,
            nomorSurat: surat.nomorSurat,
            tanggalSurat: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
            asalSurat: surat.asalSurat,
            perihal: surat.perihal,
            keterangan: surat.keterangan,
            createdById: adminUser.id
          }
        });
        createdSuratMasuk.push(created);
        console.log(`  ✓ Created: ${surat.nomorSurat} - ${surat.perihal}`);
      } catch (error) {
        console.log(`  ⚠️  Skipped ${surat.nomorSurat} (already exists)`);
      }
    }

    console.log(`\n✅ Successfully created ${createdSuratMasuk.length} surat masuk\n`);

    // Buat 10 disposisi dari 10 surat masuk pertama
    console.log('📋 Creating 10 dispositions...');
    
    const disposisiData = [
      {
        tujuanDisposisi: 'Komisi I - Pemerintahan',
        isiDisposisi: 'Mohon ditindaklanjuti untuk koordinasi dengan instansi terkait dan siapkan rekomendasi'
      },
      {
        tujuanDisposisi: 'Komisi II - Ekonomi dan Keuangan',
        isiDisposisi: 'Lakukan kajian anggaran dan dampak ekonomi, berikan usulan alokasi dana'
      },
      {
        tujuanDisposisi: 'Komisi III - Pembangunan',
        isiDisposisi: 'Koordinasikan dengan dinas terkait dan buat timeline pelaksanaan program'
      },
      {
        tujuanDisposisi: 'Komisi IV - Kesejahteraan Rakyat',
        isiDisposisi: 'Lakukan evaluasi program dan siapkan laporan progres pelaksanaan'
      },
      {
        tujuanDisposisi: 'Komisi A - Hukum dan Perundangan',
        isiDisposisi: 'Tinjau aspek hukum dan regulasi yang diperlukan untuk implementasi'
      },
      {
        tujuanDisposisi: 'Komisi I - Pemerintahan',
        isiDisposisi: 'Fasilitasi koordinasi antar daerah dan siapkan MoU kerjasama'
      },
      {
        tujuanDisposisi: 'Badan Anggaran',
        isiDisposisi: 'Lakukan verifikasi kebutuhan anggaran dan sumber pendanaan'
      },
      {
        tujuanDisposisi: 'Komisi II - Ekonomi dan Keuangan',
        isiDisposisi: 'Kaji kelayakan ekonomi program dan dampaknya terhadap APBD'
      },
      {
        tujuanDisposisi: 'Komisi IV - Kesejahteraan Rakyat',
        isiDisposisi: 'Evaluasi manfaat program terhadap kesejahteraan masyarakat'
      },
      {
        tujuanDisposisi: 'Komisi III - Pembangunan',
        isiDisposisi: 'Koordinasikan dengan kontraktor dan pastikan kualitas pekerjaan'
      }
    ];

    for (let i = 0; i < Math.min(10, createdSuratMasuk.length); i++) {
      try {
        const disposisi = await prisma.disposisi.create({
          data: {
            nomorDisposisi: `DISP-${String(i + 1).padStart(3, '0')}/DPRD/2024`,
            noUrut: i + 1,
            tanggalDisposisi: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
            tujuanDisposisi: disposisiData[i].tujuanDisposisi,
            isiDisposisi: disposisiData[i].isiDisposisi,
            keterangan: 'Harap segera ditindaklanjuti sesuai prosedur yang berlaku',
            status: 'SELESAI',
            suratMasukId: createdSuratMasuk[i].id,
            createdById: adminUser.id
          }
        });
        console.log(`  ✓ Created disposition: ${disposisi.nomorDisposisi} -> ${disposisi.tujuanDisposisi}`);
      } catch (error) {
        console.log(`  ⚠️  Failed to create disposition ${i + 1}:`, error instanceof Error ? error.message : 'Unknown error');
      }
    }

    // Summary
    const totalSuratMasuk = await prisma.suratMasuk.count();
    const totalDisposisi = await prisma.disposisi.count();
    const totalUsers = await prisma.user.count();

    return NextResponse.json({
      success: true,
      message: 'Seeding completed successfully!',
      summary: {
        totalUsers,
        totalSuratMasuk,
        totalDisposisi,
        newSuratMasuk: createdSuratMasuk.length
      }
    });

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    return NextResponse.json({ 
      error: 'Seeding failed', 
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}