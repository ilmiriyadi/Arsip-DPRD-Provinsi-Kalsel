# 📂 Sistem Manajemen Arsip Surat DPRD Kalimantan Selatan

Sistem informasi manajemen arsip surat masuk, surat keluar, dan disposisi yang dikhususkan untuk DPRD Provinsi Kalimantan Selatan. Aplikasi ini menyediakan platform digital untuk mengelola dokumen resmi dengan workflow yang terstruktur dan role-based access control.

## 🌐 Live Demo
**🔗 Akses Aplikasi: [https://arsipdprdkalsel.vercel.app/](https://arsipdprdkalsel.vercel.app/)**

> **Catatan**: Silakan daftar akun baru untuk mencoba aplikasi. Akun pertama yang mendaftar akan otomatis menjadi Administrator.

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

### � Manajemen Surat Keluar
- **CRUD Lengkap**: Create, Read, Update, Delete surat keluar (Admin only)
- **Auto Numbering**: Sistem penomoran otomatis dengan noUrut yang unique
- **Integrated Workflow**: Buat surat keluar langsung dari surat masuk dengan modal
- **Template Standardization**: Form dengan pengolah standar (Ketua DPRD, Wakil Ketua 1-3, Sekwan)
- **Conditional Icons**: Icon berubah otomatis berdasarkan status relationship
- **Cross Reference**: Relasi dengan surat masuk untuk tracking yang akurat
- **Professional Fields**: Klas surat, pengolah, perihal, dan tujuan yang lengkap

### �📋 Sistem Disposisi Terintegrasi
- **Smart Disposition Creation**: Buat disposisi langsung dari surat masuk atau manual
- **Auto NoUrut Sync**: NoUrut disposisi otomatis sinkron dengan surat masuk terkait
- **Target Selection**: Pilihan tujuan disposisi (Pimpinan DPRD, SEKWAN, RTA, Persidangan, Keuangan, Fraksi)
- **Auto Content Generation**: Isi disposisi auto-generate dengan template yang dapat diedit
- **Status Simplified**: Status "SELESAI" untuk workflow yang efisien
- **Quick Copy Feature**: Copy surat masuk ke disposisi dengan modal selection
- **Excel Export**: Export semua data disposisi ke format Excel dengan format standar

### 🔍 Pencarian & Filter Canggih
- **Real-time Search**: Pencarian instant dengan 300ms debouncing
- **Multi-field Search**: Cari berdasarkan nomor surat, asal surat, atau perihal
- **Date Range Filter**: Filter berdasarkan tanggal specific atau rentang tanggal
- **Month Filter**: Filter data per bulan dengan dropdown selection
- **Instant Results**: Hasil pencarian tampil secara real-time tanpa refresh

### 📊 Dashboard & Analytics
- **Comprehensive Statistics**: Statistik total surat masuk, surat keluar, disposisi, dan pending dispositions
- **Multi-Metric Overview**: Track semua aspek workflow dokumen dalam satu dashboard
- **Pending Calculator**: Otomatis hitung disposisi pending (surat masuk - disposisi selesai)
- **User Management**: Admin dapat mengelola pengguna sistem
- **Data Export**: Export disposisi ke Excel dengan format yang terstruktur
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
- **Language**: TypeScript 5+ untuk type safety
- **Styling**: Tailwind CSS 4+ dengan custom gradient design
- **UI Components**: Lucide React Icons v0.545.0
- **State Management**: React 19.1.0 Hooks (useState, useEffect)
- **Form Handling**: React Hook Form v7.64.0 dengan Zod validation
- **Excel Export**: SheetJS (xlsx) untuk export data ke format Excel

### Backend
- **Runtime**: Node.js dengan Next.js 15 API Routes
- **Database**: SQLite (development) / PostgreSQL (production ready)
- **ORM**: Prisma v6.17.0 dengan auto-migration dan Client generation
- **Authentication**: NextAuth.js v4.24.11 dengan Prisma adapter
- **Security**: bcryptjs untuk password hashing

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

#### Surat Keluar Management
- ✅ **View**: Lihat semua daftar surat keluar dengan detail lengkap
- ✅ **Create**: Buat surat keluar baru manual atau dari surat masuk
- ✅ **Edit**: Edit semua field surat keluar existing
- ✅ **Delete**: Hapus surat keluar (dengan konfirmasi)
- ✅ **Integrated Workflow**: Buat surat keluar langsung dari surat masuk

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
- ✅ **View Surat Keluar**: Lihat daftar dan detail surat keluar
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
   # Buat file .env.local dengan konfigurasi berikut:
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_SECRET="your-super-secret-key-min-32-characters"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Database Setup**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run database migrations
   npx prisma migrate dev --name init
   
   # Push schema to database (alternative)
   npx prisma db push
   ```

5. **Development Server**
   ```bash
   npm run dev
   ```

6. **Akses Aplikasi**
   - Buka browser: `http://localhost:3000`
   - Register akun pertama (akan menjadi ADMIN)
   - Login dan mulai mengelola arsip surat

### 🔧 Perubahan Terbaru & Fixes

### v1.2.0 - November 2025
- ✅ **Surat Keluar Module**: Sistem CRUD lengkap untuk surat keluar
- ✅ **Integrated Workflow**: Buat surat keluar langsung dari surat masuk dengan modal
- ✅ **Conditional UI**: Icon berubah otomatis berdasarkan relationship status
- ✅ **Dashboard Enhancement**: Tambah statistik surat keluar di dashboard
- ✅ **Landing Page Update**: Update fitur showcase dengan surat keluar
- ✅ **Cross-Reference System**: Relasi antara surat masuk dan surat keluar

### v1.1.0 - Oktober 2025
- ✅ **Fix Path Alias**: Diperbaiki konfigurasi `@/*` di tsconfig.json untuk mengatasi module resolution error
- ✅ **Build Script Fix**: Dihapus referensi ke `check-schema.js` yang tidak diperlukan
- ✅ **Turbopack Integration**: Full support untuk Turbopack di development dan build
- ✅ **Module Resolution**: Semua import paths sudah tervalidasi dan berfungsi dengan baik
- ✅ **Production Ready**: Build process sudah dioptimalkan untuk deployment

### Troubleshooting Common Issues

#### Build Errors
```bash
# Jika mengalami module not found error:
npm install
npx prisma generate
npm run build

# Jika path alias bermasalah, pastikan tsconfig.json:
"paths": { "@/*": ["./*"] }
```

#### Database Issues  
```bash
# Reset database jika diperlukan:
npx prisma migrate reset
npx prisma db push

# Generate client jika ada perubahan schema:
npx prisma generate
```

### 🏗️ Build & Production

```bash
# Build for production (dengan Turbopack)
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Development dengan Turbopack
npm run dev
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

### � Surat Keluar Table
```sql
- id: String (Primary Key, CUID)
- noUrut: Int (UNIQUE, NOT NULL)
- klas: String (NOT NULL)
- pengolah: Enum (KETUA_DPRD | WAKIL_KETUA_1 | WAKIL_KETUA_2 | WAKIL_KETUA_3 | SEKWAN)
- tanggalSurat: DateTime (NOT NULL)
- perihalSurat: String (NOT NULL)
- kirimKepada: String (NOT NULL)
- suratMasukId: String (NULLABLE, Foreign Key -> Surat Masuk)
- createdById: String (Foreign Key -> Users)
- createdAt: DateTime (AUTO)
- updatedAt: DateTime (AUTO)
```

### �🔗 Relationships
- **Users → Surat Masuk**: One-to-Many (createdBy)
- **Users → Surat Keluar**: One-to-Many (createdBy)
- **Users → Disposisi**: One-to-Many (createdBy)  
- **Surat Masuk → Disposisi**: One-to-Many (dispositions)
- **Surat Masuk → Surat Keluar**: One-to-Many (outgoing letters)

### 📊 Business Rules
1. **NoUrut Sync**: `disposisi.noUrut` harus sama dengan `surat_masuk.noUrut`
2. **Unique Constraints**: `surat_masuk.noUrut`, `surat_masuk.nomorSurat`, dan `surat_keluar.noUrut` harus unique
3. **Role Validation**: Hanya ADMIN yang dapat create/update/delete
4. **Cascade Delete**: Hapus surat masuk akan hapus disposisi terkait
5. **Optional Relationship**: Surat keluar dapat dibuat mandiri atau terhubung dengan surat masuk
6. **Conditional UI**: Icon berubah berdasarkan existing relationships

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

### Surat Keluar Management
```
GET    /api/surat-keluar                - List dengan search & filter
POST   /api/surat-keluar                - Create surat keluar (Admin only)
GET    /api/surat-keluar/[id]           - Get surat keluar detail
PUT    /api/surat-keluar/[id]           - Update surat keluar (Admin only)
DELETE /api/surat-keluar/[id]           - Delete surat keluar (Admin only)
```

### Disposisi Management
```
GET    /api/disposisi                   - List dengan search & filter
POST   /api/disposisi                   - Create disposisi (Admin only)
GET    /api/disposisi/[id]              - Get disposisi detail
PUT    /api/disposisi/[id]              - Update disposisi (Admin only)  
DELETE /api/disposisi/[id]              - Delete disposisi (Admin only)
GET    /api/disposisi/export            - Export semua disposisi ke Excel
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

#### Mengelola Surat Keluar
1. **Buat Surat Keluar Manual**:
   - Masuk ke halaman Surat Keluar → Tambah
   - Isi No Urut (unique), Klas, Pengolah, Tanggal
   - Tulis perihal dan tujuan surat keluar
   - Simpan surat keluar

2. **Buat Surat Keluar dari Surat Masuk** (Recommended):
   - Di halaman Surat Masuk, klik tombol "Buat Surat Keluar" (icon Send)
   - Form akan auto-fill berdasarkan surat masuk
   - Edit informasi yang diperlukan
   - Simpan dan surat keluar akan terhubung dengan surat masuk

3. **Edit/Hapus Surat Keluar**:
   - Klik ikon edit/delete di daftar surat keluar
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

3. **Export Data ke Excel**:
   - Di halaman Disposisi, klik tombol "Export Excel"
   - File Excel akan otomatis terdownload
   - Format Excel mencakup: Nomor, Nomor Surat, Hari/Tanggal, Hal, Asal Surat, Disposisi Surat, Tanggal Disposisi

#### User Management
1. **Tambah User**: 
   - Masuk ke Settings → Manajemen Pengguna
   - Klik "Tambah Pengguna"
   - Set role (Admin/Member) dan informasi user

2. **Edit/Hapus User**:
   - Gunakan action buttons di daftar user
   - Admin tidak bisa hapus diri sendiri

### 👤 Untuk Member
1. **Lihat Data**: Akses read-only ke semua surat masuk, surat keluar, dan disposisi
2. **Pencarian**: Gunakan search box untuk find data across all modules
3. **Filter**: Filter by date range atau month untuk semua jenis dokumen
4. **Detail**: Klik item untuk lihat detail lengkap termasuk relationships

### 🔍 Fitur Pencarian (All Users)
1. **Real-time Search**: Ketik di search box, hasil muncul otomatis
2. **Filter Tanggal**: Gunakan date picker untuk filter range
3. **Filter Bulan**: Pilih bulan specific dari dropdown
4. **Combine Filters**: Gabungkan search + date filter untuk hasil optimal

### 📊 Export Data (All Users)
1. **Excel Export**: 
   - Klik tombol "Export Excel" di halaman Disposisi
   - Semua data disposisi akan diexport dalam format Excel
   - Format sesuai standar dengan kolom: Nomor, Nomor Surat, Hari/Tanggal, Hal, Asal Surat, Disposisi Surat, Tanggal Disposisi
   - File otomatis terdownload dengan nama file berisi tanggal export

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

# Setup environment variables
cp .env.example .env.production
# Edit .env.production dengan konfigurasi production

# Database setup untuk production
npx prisma generate
npx prisma migrate deploy

# Production build
npm run build

# Start dengan PM2 (recommended)
npm install pm2 -g
pm2 start npm --name "arsip-surat" -- start
pm2 startup
pm2 save
```

### Docker Deployment (Optional)
```dockerfile
# Dockerfile contoh
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npx prisma generate
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 📁 Struktur Proyek
```
arsip-surat/
├── app/                        # Next.js 15 App Router
│   ├── api/                   # API Routes
│   │   ├── auth/
│   │   │   └── [...nextauth]/ # NextAuth.js endpoint
│   │   ├── disposisi/         # Disposisi API endpoints
│   │   │   ├── route.ts       # GET, POST disposisi
│   │   │   └── [id]/          # Individual disposisi operations
│   │   ├── register/          # User registration API
│   │   ├── surat-keluar/      # Surat keluar API endpoints
│   │   │   ├── route.ts       # GET, POST surat keluar
│   │   │   └── [id]/          # Individual surat keluar operations
│   │   ├── surat-masuk/       # Surat masuk API endpoints
│   │   │   ├── route.ts       # GET, POST surat masuk
│   │   │   └── [id]/          # Individual surat operations
│   │   │       └── copy-disposisi/ # Copy to disposisi API
│   │   └── users/             # User management API
│   ├── dashboard/             # Protected dashboard pages
│   │   ├── page.tsx          # Main dashboard
│   │   ├── admin/            # Admin-only pages
│   │   │   ├── settings/     # Admin settings
│   │   │   └── users/        # User management
│   │   ├── disposisi/        # Disposisi management
│   │   │   ├── page.tsx      # Disposisi list
│   │   │   ├── [id]/         # Disposisi detail
│   │   │   ├── add/          # Add new disposisi
│   │   │   └── edit/[id]/    # Edit disposisi
│   │   ├── settings/         # User settings
│   │   ├── surat-keluar/     # Surat keluar management
│   │   │   ├── page.tsx      # Surat keluar list
│   │   │   ├── [id]/         # Surat keluar detail
│   │   │   ├── add/          # Add new surat keluar
│   │   │   └── edit/[id]/    # Edit surat keluar
│   │   └── surat-masuk/      # Surat masuk management
│   │       ├── page.tsx      # Surat masuk list
│   │       ├── [id]/         # Surat detail
│   │       ├── add/          # Add new surat
│   │       └── edit/[id]/    # Edit surat
│   ├── login/                 # Authentication pages
│   ├── register/             # User registration
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Home page
│   └── globals.css           # Global styles
├── components/                # React components
│   ├── layout/               # Layout components
│   │   └── DashboardLayout.tsx # Main dashboard layout
│   └── providers.tsx         # Context providers
├── lib/                      # Utility libraries
│   ├── auth.ts              # NextAuth configuration
│   └── prisma.ts            # Prisma client setup
├── prisma/                   # Database configuration
│   ├── schema.prisma        # Database schema
│   └── migrations/          # Database migration files
├── types/                    # TypeScript type definitions
│   └── next-auth.d.ts       # NextAuth type extensions
├── public/                   # Static assets
├── middleware.ts             # Next.js middleware for route protection
├── next.config.ts            # Next.js configuration
├── tsconfig.json            # TypeScript configuration
├── tailwind.config.js       # Tailwind CSS configuration
├── eslint.config.mjs        # ESLint configuration
├── package.json             # Dependencies and scripts
└── README.md               # Project documentation
```

### 📋 Key Features dari Struktur
- **App Router**: Menggunakan Next.js 15 App Router untuk file-based routing
- **API Routes**: RESTful API dengan proper error handling dan validation
- **Middleware**: Route protection dan authentication middleware
- **TypeScript**: Full type safety di seluruh aplikasi
- **Prisma**: Type-safe database operations dengan migration support
- **Modular Components**: Reusable components dengan proper separation of concerns


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
