# Sistem Arsip Surat

Aplikasi web untuk mengelola arsip surat masuk dan disposisi dengan sistem role-based access control.

## Fitur Utama

### 🔐 Autentikasi & Otorisasi
- **Login/Register**: Sistem autentikasi yang aman dengan NextAuth.js
- **Role-based Access**: Admin dan Member dengan hak akses berbeda
- **Session Management**: Pengelolaan sesi pengguna yang aman

### 📄 Manajemen Surat Masuk
- **CRUD Operations**: Tambah, lihat, edit, dan hapus surat masuk
- **Detail Lengkap**: Nomor surat, tanggal, asal surat, perihal, keterangan
- **File Upload**: Dukungan untuk menyimpan file surat (opsional)

### 📋 Manajemen Disposisi
- **Buat Disposisi**: Buat disposisi untuk surat masuk
- **Status Tracking**: PENDING, DIPROSES, SELESAI, DITOLAK
- **Relasi Surat**: Setiap disposisi terhubung dengan surat masuk

### 🔍 Pencarian & Filter
- **Pencarian Teks**: Cari berdasarkan nomor surat, asal, atau perihal
- **Filter Tanggal**: Filter berdasarkan rentang tanggal
- **Filter Bulan**: Tampilkan data per bulan tertentu
- **Pagination**: Navigasi data yang efisien

## Teknologi yang Digunakan

- **Framework**: Next.js 15 dengan App Router
- **Database**: SQLite dengan Prisma ORM
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **UI Components**: Lucide React Icons
- **Type Safety**: TypeScript
- **Validation**: Zod
- **Form Handling**: React Hook Form

## Role & Permissions

### 👑 Admin
- ✅ Melihat semua surat masuk dan disposisi
- ✅ Menambah, edit, dan hapus surat masuk
- ✅ Membuat dan mengelola disposisi
- ✅ Manajemen pengguna
- ✅ Akses ke semua fitur sistem

### 👤 Member
- ✅ Melihat daftar surat masuk
- ✅ Melihat detail surat dan disposisi
- ✅ Menggunakan fitur pencarian dan filter
- ❌ Tidak dapat menambah/edit/hapus data
- ❌ Tidak dapat akses area admin

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm atau yarn

### Instalasi

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Setup database**
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

3. **Jalankan aplikasi**
   ```bash
   npm run dev
   ```

4. **Akses aplikasi**
   Buka browser dan kunjungi: `http://localhost:3000`

## Struktur Database

### Users
- Role-based access (ADMIN/MEMBER)
- Secure authentication dengan bcrypt

### Surat Masuk
- Nomor surat unik
- Tracking tanggal dan asal surat
- Relasi dengan disposisi

### Disposisi
- Status workflow (PENDING → DIPROSES → SELESAI)
- Terhubung dengan surat masuk
- Audit trail lengkap

## API Endpoints

### Authentication
- `POST /api/register` - Registrasi user baru
- `GET/POST /api/auth/[...nextauth]` - NextAuth endpoints

### Surat Masuk
- `GET /api/surat-masuk` - List dengan pagination & filter
- `POST /api/surat-masuk` - Tambah surat baru (Admin only)
- `GET/PUT/DELETE /api/surat-masuk/[id]` - CRUD operations

### Disposisi
- `GET /api/disposisi` - List dengan pagination & filter
- `POST /api/disposisi` - Buat disposisi baru (Admin only)
- `GET/PUT/DELETE /api/disposisi/[id]` - CRUD operations

## Cara Penggunaan

1. **Registrasi**: Buat akun baru (default role: Member)
2. **Login**: Akses sistem dengan kredensial
3. **Dashboard**: Lihat overview dan statistik
4. **Kelola Surat**: Admin dapat CRUD surat masuk
5. **Buat Disposisi**: Admin dapat membuat disposisi
6. **Filter & Cari**: Gunakan fitur pencarian advanced

## Deploy on Vercel

1. Push code ke GitHub
2. Import project ke Vercel
3. Set environment variables:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`
4. Deploy!

---

**Dibuat dengan ❤️ menggunakan Next.js, Prisma, dan TypeScript**
