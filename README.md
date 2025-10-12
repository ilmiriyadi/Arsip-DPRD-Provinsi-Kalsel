# 📂 Sistem Manajemen Arsip Surat Masuk DPRD Kalimantan Selatan

Sistem informasi manajemen arsip surat masuk dan disposisi yang dikhususkan untuk DPRD Provinsi Kalimantan Selatan. Aplikasi ini menyediakan platform digital untuk mengelola dokumen resmi dengan workflow yang terstruktur dan role-based access control.

## ✨ Fitur Utama

### 🔐 Sistem Autentikasi & Keamanan
- **Login/Register Aman**: Autentikasi dengan NextAuth.js dan bcrypt encryption
- **Role-based Access Control**: Admin (full access) dan Member (read-only)
- **Session Management**: Pengelolaan sesi yang aman dengan automatic logout
- **Protected Routes**: Route protection berdasarkan role pengguna

### 📄 Manajemen Surat Masuk
- **CRUD Lengkap**: Create, Read, Update, Delete surat masuk (Admin only)
- **Detail Komprehensif**: No Urut, Nomor Surat, Tanggal, Asal Surat, Perihal, Keterangan
- **Validasi Unik**: Nomor surat dan no urut yang unique untuk mencegah duplikasi
- **File Path Support**: Dukungan untuk menyimpan path file dokumen

### 📋 Sistem Disposisi Terintegrasi
- **Smart Disposition Creation**: Buat disposisi langsung dari surat masuk atau manual
- **Auto NoUrut Sync**: NoUrut disposisi otomatis sinkron dengan surat masuk terkait
- **Target Selection**: Pilihan tujuan disposisi (Pimpinan DPRD, SEKWAN, RTA, Persidangan, Keuangan, Fraksi)
- **Auto Content Generation**: Isi disposisi auto-generate dengan template yang dapat diedit
- **Status Simplified**: Status "SELESAI" untuk workflow yang efisien
- **Quick Copy Feature**: Copy surat masuk ke disposisi dengan modal selection

### 🔍 Pencarian & Filter Canggih
- **Real-time Search**: Pencarian instant dengan 300ms debouncing
- **Multi-field Search**: Cari berdasarkan nomor surat, asal surat, atau perihal
- **Date Range Filter**: Filter berdasarkan tanggal specific atau rentang tanggal
- **Month Filter**: Filter data per bulan dengan dropdown selection
- **Instant Results**: Hasil pencarian tampil secara real-time tanpa refresh

### 📊 Dashboard & Analytics
- **Statistics Overview**: Statistik total surat masuk, disposisi, dan pending dispositions
- **Pending Calculator**: Otomatis hitung disposisi pending (surat masuk - disposisi selesai)
- **User Management**: Admin dapat mengelola pengguna sistem
- **Clean Interface**: Dashboard dengan DPRD Kalimantan Selatan branding

### 🎨 User Experience
- **Professional Design**: UI dengan branding resmi DPRD Kalimantan Selatan
- **Responsive Layout**: Optimal di desktop, tablet, dan mobile
- **Consistent Navigation**: Persistent sidebar untuk navigasi yang mudah
- **Improved Readability**: Input text dengan contrast tinggi (text-gray-900)
- **Loading States**: Proper loading indicators dan error handling

## 🛠️ Teknologi & Stack

### Frontend
- **Framework**: Next.js 15.5.4 dengan App Router & Turbopack
- **Language**: TypeScript untuk type safety
- **Styling**: Tailwind CSS dengan custom gradient design
- **UI Components**: Lucide React Icons
- **State Management**: React Hooks (useState, useEffect)
- **Form Handling**: Native form handling dengan real-time validation

### Backend
- **Runtime**: Node.js dengan Next.js API Routes
- **Database**: SQLite (development) / PostgreSQL (production ready)
- **ORM**: Prisma ORM dengan auto-migration
- **Authentication**: NextAuth.js dengan session strategy

### Development Tools
- **Package Manager**: npm
- **Code Quality**: ESLint dengan TypeScript rules
- **Version Control**: Git dengan structured commit messages
- **Development Server**: Next.js dev server dengan hot reload

## 🔑 Role & Permissions

### 👑 Administrator (ADMIN)
#### Surat Masuk Management
- ✅ **View**: Lihat semua daftar surat masuk dengan pagination
- ✅ **Create**: Tambah surat masuk baru dengan validasi unique
- ✅ **Edit**: Edit semua field surat masuk existing
- ✅ **Delete**: Hapus surat masuk (dengan konfirmasi)
- ✅ **Search & Filter**: Akses penuh ke semua fitur pencarian

#### Disposisi Management  
- ✅ **View**: Lihat semua disposisi dengan detail lengkap
- ✅ **Create**: Buat disposisi baru manual atau copy dari surat masuk
- ✅ **Edit**: Edit disposisi existing dengan auto-sync noUrut
- ✅ **Delete**: Hapus disposisi (dengan konfirmasi)
- ✅ **Quick Actions**: Copy surat masuk ke disposisi dengan modal selection

#### System Administration
- ✅ **User Management**: Kelola users, tambah, edit, hapus pengguna
- ✅ **Dashboard Analytics**: Akses statistik lengkap sistem
- ✅ **All Navigation**: Akses ke semua menu sidebar

### 👤 Member (MEMBER)
#### Read-Only Access
- ✅ **View Surat Masuk**: Lihat daftar dan detail surat masuk
- ✅ **View Disposisi**: Lihat daftar dan detail disposisi
- ✅ **Search & Filter**: Gunakan semua fitur pencarian dan filter
- ✅ **Dashboard View**: Lihat statistik dasar (tanpa user management)

#### Restrictions
- ❌ **No Create/Edit/Delete**: Tidak dapat mengubah data apapun
- ❌ **No User Management**: Tidak dapat akses area admin
- ❌ **No Admin Features**: Tombol add/edit/delete tidak tampil

## 🚀 Getting Started

### Prerequisites
- **Node.js**: Version 18.17.0 atau lebih tinggi
- **npm**: Version 9.0.0 atau lebih tinggi
- **Git**: Untuk version control

### 📥 Instalasi

1. **Clone Repository**
   ```bash
   git clone https://github.com/ilmiriyadi/Arsip-DPRD-Provinsi-Kalsel.git
   cd Arsip-DPRD-Provinsi-Kalsel
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy environment file
   cp .env.example .env.local
   
   # Edit .env.local dengan konfigurasi Anda:
   # DATABASE_URL="file:./dev.db"
   # NEXTAUTH_SECRET="your-secret-key"
   # NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Database Setup**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run database migrations
   npx prisma migrate dev --name init
   
   # (Optional) Seed database dengan data sample
   npx prisma db seed
   ```

5. **Development Server**
   ```bash
   npm run dev
   ```

6. **Akses Aplikasi**
   - Buka browser: `http://localhost:3000`
   - Register akun pertama (akan menjadi ADMIN)
   - Login dan mulai mengelola arsip surat

### 🏗️ Build & Production

```bash
# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## 🗄️ Struktur Database

### 👥 Users Table
```sql
- id: String (Primary Key, CUID)
- name: String (NOT NULL)
- email: String (UNIQUE, NOT NULL)
- password: String (NOT NULL, bcrypt hashed)
- role: Enum (ADMIN | MEMBER, DEFAULT: MEMBER)
- createdAt: DateTime (AUTO)
- updatedAt: DateTime (AUTO)
```

### 📄 Surat Masuk Table  
```sql
- id: String (Primary Key, CUID)
- noUrut: Int (UNIQUE, NOT NULL)
- nomorSurat: String (UNIQUE, NOT NULL)
- tanggalSurat: DateTime (NOT NULL)
- asalSurat: String (NOT NULL)
- perihal: Text (NOT NULL)
- keterangan: Text (NULLABLE)
- filePath: String (NULLABLE)
- createdById: String (Foreign Key -> Users)
- createdAt: DateTime (AUTO)
- updatedAt: DateTime (AUTO)
```

### 📋 Disposisi Table
```sql
- id: String (Primary Key, CUID)
- noUrut: Int (NOT NULL, syncs with surat_masuk.noUrut)
- nomorDisposisi: String (NULLABLE, auto-generated)
- tanggalDisposisi: DateTime (NOT NULL)
- tujuanDisposisi: String (NOT NULL)
- isiDisposisi: Text (NOT NULL)
- keterangan: Text (NULLABLE)
- status: Enum (SELESAI, DEFAULT: SELESAI)
- suratMasukId: String (Foreign Key -> Surat Masuk)
- createdById: String (Foreign Key -> Users)
- createdAt: DateTime (AUTO)
- updatedAt: DateTime (AUTO)
```

### 🔗 Relationships
- **Users → Surat Masuk**: One-to-Many (createdBy)
- **Users → Disposisi**: One-to-Many (createdBy)  
- **Surat Masuk → Disposisi**: One-to-Many (dispositions)

### 📊 Business Rules
1. **NoUrut Sync**: `disposisi.noUrut` harus sama dengan `surat_masuk.noUrut`
2. **Unique Constraints**: `surat_masuk.noUrut` dan `surat_masuk.nomorSurat` harus unique
3. **Role Validation**: Hanya ADMIN yang dapat create/update/delete
4. **Cascade Delete**: Hapus surat masuk akan hapus disposisi terkait

## 🔌 API Endpoints

### Authentication & Users
```
POST   /api/register                    - Register user baru
GET    /api/auth/[...nextauth]          - NextAuth.js endpoints
POST   /api/auth/[...nextauth]          - Login/logout/callback
GET    /api/users                       - Get users list (Admin only)
PUT    /api/users/[id]                  - Update user (Admin only)
DELETE /api/users/[id]                  - Delete user (Admin only)
```

### Surat Masuk Management
```
GET    /api/surat-masuk                 - List dengan search & filter
POST   /api/surat-masuk                 - Create surat baru (Admin only)
GET    /api/surat-masuk/[id]            - Get surat detail
PUT    /api/surat-masuk/[id]            - Update surat (Admin only)
DELETE /api/surat-masuk/[id]            - Delete surat (Admin only)
POST   /api/surat-masuk/[id]/copy-disposisi - Copy to disposisi (Admin only)
```

### Disposisi Management
```
GET    /api/disposisi                   - List dengan search & filter
POST   /api/disposisi                   - Create disposisi (Admin only)
GET    /api/disposisi/[id]              - Get disposisi detail
PUT    /api/disposisi/[id]              - Update disposisi (Admin only)  
DELETE /api/disposisi/[id]              - Delete disposisi (Admin only)
```

### Query Parameters
```
# Untuk GET requests:
?page=1&limit=10           - Pagination
?search=keyword            - Text search
?month=2024-01            - Filter by month
?startDate=2024-01-01     - Date range start
?endDate=2024-01-31       - Date range end
```

### Response Format
```json
{
  "success": true,
  "data": {...},
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

## 📖 Cara Penggunaan

### 🔐 Getting Started
1. **Registrasi Pertama**: 
   - Kunjungi `/register`
   - Isi form registrasi (akun pertama otomatis menjadi ADMIN)
   - Login dengan kredensial yang dibuat

2. **Login ke Sistem**:
   - Gunakan email dan password untuk login
   - Session akan tersimpan otomatis
   - Redirect ke dashboard sesuai role

### 👑 Untuk Administrator

#### Mengelola Surat Masuk
1. **Tambah Surat Masuk**:
   - Klik "Tambah Surat" di halaman Surat Masuk
   - Isi No Urut (unique), Nomor Surat, Tanggal, Asal, Perihal
   - Tambahkan keterangan dan file path jika diperlukan
   - Simpan surat

2. **Edit/Hapus Surat**:
   - Klik ikon edit/delete di daftar surat
   - Update informasi yang diperlukan
   - Konfirmasi perubahan

#### Mengelola Disposisi  
1. **Buat Disposisi Manual**:
   - Masuk ke halaman Disposisi → Tambah
   - Pilih surat masuk terkait
   - NoUrut akan otomatis sinkron
   - Pilih tujuan disposisi dari dropdown atau ketik manual
   - Tulis isi disposisi dan keterangan

2. **Copy Surat ke Disposisi** (Recommended):
   - Di halaman Surat Masuk, klik tombol "Buat Disposisi"
   - Pilih tujuan disposisi di modal
   - Isi disposisi akan auto-generate
   - Edit jika diperlukan dan simpan

#### User Management
1. **Tambah User**: 
   - Masuk ke Settings → Manajemen Pengguna
   - Klik "Tambah Pengguna"
   - Set role (Admin/Member) dan informasi user

2. **Edit/Hapus User**:
   - Gunakan action buttons di daftar user
   - Admin tidak bisa hapus diri sendiri

### 👤 Untuk Member
1. **Lihat Data**: Akses read-only ke semua surat masuk dan disposisi
2. **Pencarian**: Gunakan search box untuk find data
3. **Filter**: Filter by date range atau month
4. **Detail**: Klik item untuk lihat detail lengkap

### 🔍 Fitur Pencarian (All Users)
1. **Real-time Search**: Ketik di search box, hasil muncul otomatis
2. **Filter Tanggal**: Gunakan date picker untuk filter range
3. **Filter Bulan**: Pilih bulan specific dari dropdown
4. **Combine Filters**: Gabungkan search + date filter untuk hasil optimal

## 🚀 Deployment

### Vercel (Recommended)
1. **Push ke GitHub**: Code sudah tersedia di repository
2. **Import ke Vercel**:
   - Kunjungi [vercel.com](https://vercel.com)
   - Import repository: `ilmiriyadi/Arsip-DPRD-Provinsi-Kalsel`
3. **Environment Variables**:
   ```env
   DATABASE_URL="postgresql://username:password@host:port/dbname"
   NEXTAUTH_SECRET="random-32-character-secret-key"
   NEXTAUTH_URL="https://your-app.vercel.app"
   ```
4. **Database Setup**:
   - Gunakan PostgreSQL (Supabase/PlanetScale recommended)
   - Run migration: `npx prisma migrate deploy`
5. **Deploy**: Vercel akan auto-deploy dari GitHub

### Manual/VPS Deployment
```bash
# Clone dan setup
git clone https://github.com/ilmiriyadi/Arsip-DPRD-Provinsi-Kalsel.git
cd Arsip-DPRD-Provinsi-Kalsel
npm install

# Production build
npm run build

# Start dengan PM2 (recommended)
npm install pm2 -g
pm2 start npm --name "arsip-surat" -- start
```

## 📁 Struktur Proyek
```
arsip-surat/
├── src/
│   ├── app/                    # Next.js 15 App Router
│   │   ├── api/               # API Routes
│   │   ├── dashboard/         # Protected dashboard pages
│   │   ├── login/            # Authentication pages
│   │   └── register/
│   ├── components/            # React components
│   │   ├── layout/           # Layout components
│   │   └── ui/              # UI components
│   ├── lib/                  # Utility libraries
│   └── types/               # TypeScript type definitions
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── migrations/          # Migration files
├── public/                  # Static assets
└── README.md               # Project documentation
```


## 🙏 Acknowledgments
- **DPRD Provinsi Kalimantan Selatan** - untuk requirements dan feedback
- **Next.js Team** - untuk framework yang powerful
- **Prisma Team** - untuk database toolkit yang excellent
- **Tailwind CSS** - untuk utility-first CSS framework

---

## 📞 Support
Untuk pertanyaan atau dukungan teknis:
- **Instagram**: [ilmi_riyadi](https://www.instagram.com/ilmi_riyadi)
- **Developer**: [ilmiriyadi](https://github.com/ilmiriyadi)
- **Repository**: [Arsip-DPRD-Provinsi-Kalsel](https://github.com/ilmiriyadi/Arsip-DPRD-Provinsi-Kalsel)
- **Issues**: Gunakan GitHub Issues untuk melaporkan bug atau request feature

**Dibuat oleh ilmi_riyadi untuk DPRD Provinsi Kalimantan Selatan menggunakan Next.js 15, Prisma, dan TypeScript**
