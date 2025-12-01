# Use Case Diagram - Sistem Manajemen Arsip DPRD Kalimantan Selatan

## 📊 Use Case Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    SISTEM MANAJEMEN ARSIP DPRD KALSEL                       │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌──────────┐
    │  Admin   │
    │ (ADMIN)  │
    └────┬─────┘
         │
         │──────► Login ke Sistem
         │
         │──────► Kelola Surat Masuk
         │         ├── Lihat Daftar Surat Masuk
         │         ├── Tambah Surat Masuk
         │         ├── Edit Surat Masuk
         │         ├── Hapus Surat Masuk
         │         └── Search & Filter Surat Masuk
         │
         │──────► Kelola Surat Keluar
         │         ├── Lihat Daftar Surat Keluar
         │         ├── Tambah Surat Keluar
         │         ├── Buat Surat Keluar dari Surat Masuk
         │         ├── Edit Surat Keluar
         │         └── Hapus Surat Keluar
         │
         │──────► Kelola Disposisi
         │         ├── Lihat Daftar Disposisi
         │         ├── Tambah Disposisi
         │         ├── Copy Surat Masuk ke Disposisi
         │         ├── Edit Disposisi
         │         ├── Hapus Disposisi
         │         └── Export Disposisi ke Excel
         │
         │──────► Kelola Surat Tamu
         │         ├── Lihat Daftar Surat Tamu
         │         ├── Tambah Surat Tamu
         │         ├── Edit Surat Tamu
         │         └── Hapus Surat Tamu
         │
         │──────► Kelola User
         │         ├── Lihat Daftar User
         │         ├── Tambah User Baru
         │         ├── Edit User
         │         ├── Hapus User
         │         └── Ubah Role User
         │
         │──────► Monitor Audit Log
         │         ├── Lihat Activity Log
         │         ├── Filter Log by Action
         │         ├── Filter Log by Entity
         │         └── Filter Log by Date Range
         │
         │──────► Lihat Dashboard Statistik
         │
         │──────► Logout dari Sistem


    ┌──────────┐
    │  Member  │
    │ (MEMBER) │
    └────┬─────┘
         │
         │──────► Login ke Sistem
         │
         │──────► Lihat Surat Masuk
         │         ├── Lihat Daftar Surat Masuk
         │         ├── Lihat Detail Surat Masuk
         │         └── Search & Filter Surat Masuk
         │
         │──────► Lihat Surat Keluar
         │         ├── Lihat Daftar Surat Keluar
         │         └── Lihat Detail Surat Keluar
         │
         │──────► Lihat Disposisi
         │         ├── Lihat Daftar Disposisi
         │         └── Lihat Detail Disposisi
         │
         │──────► Lihat Surat Tamu
         │         ├── Lihat Daftar Surat Tamu
         │         └── Lihat Detail Surat Tamu
         │
         │──────► Lihat Dashboard Statistik
         │
         │──────► Logout dari Sistem


    ┌──────────┐
    │   Tamu   │
    │  (Guest) │
    └────┬─────┘
         │
         │──────► Login Tamu
         │
         │──────► Lihat Dashboard Tamu
         │
         │──────► Logout dari Sistem
```

## 🎭 Actors

### 1. Admin (Administrator)
**Deskripsi**: Pengguna dengan hak akses penuh terhadap sistem.

**Karakteristik**:
- Dapat melakukan semua operasi CRUD (Create, Read, Update, Delete)
- Mengelola user dan hak akses
- Mengakses audit log untuk monitoring keamanan
- Mengekspor data ke Excel

**Role dalam sistem**: `ADMIN`

---

### 2. Member (Anggota)
**Deskripsi**: Pengguna dengan hak akses read-only (hanya lihat).

**Karakteristik**:
- Hanya dapat melihat data (Read-only)
- Dapat menggunakan fitur search dan filter
- Dapat melihat dashboard statistik
- Tidak dapat mengubah, menambah, atau menghapus data

**Role dalam sistem**: `MEMBER`

---

### 3. Tamu (Guest)
**Deskripsi**: Pengunjung yang datang ke kantor DPRD.

**Karakteristik**:
- Akses terbatas hanya ke dashboard tamu
- Tidak dapat mengakses data surat
- Hanya untuk keperluan registrasi kunjungan

**Role dalam sistem**: Guest (tidak ada role di database, akses route terpisah)

---

## 📋 Use Cases Summary

| No | Use Case | Actor | Deskripsi |
|----|----------|-------|-----------|
| UC-01 | Login ke Sistem | Admin, Member, Tamu | Autentikasi pengguna untuk akses sistem |
| UC-02 | Logout dari Sistem | Admin, Member, Tamu | Keluar dari sistem dan mengakhiri sesi |
| UC-03 | Kelola Surat Masuk | Admin | CRUD surat masuk dengan validasi |
| UC-04 | Kelola Surat Keluar | Admin | CRUD surat keluar dan integrasi dengan surat masuk |
| UC-05 | Kelola Disposisi | Admin | CRUD disposisi dengan auto-sync noUrut |
| UC-06 | Kelola Surat Tamu | Admin | CRUD data kunjungan tamu |
| UC-07 | Kelola User | Admin | Manajemen pengguna sistem |
| UC-08 | Monitor Audit Log | Admin | Melihat dan filter activity log sistem |
| UC-09 | Lihat Surat Masuk | Member | View-only akses ke data surat masuk |
| UC-10 | Lihat Surat Keluar | Member | View-only akses ke data surat keluar |
| UC-11 | Lihat Disposisi | Member | View-only akses ke data disposisi |
| UC-12 | Lihat Surat Tamu | Member | View-only akses ke data surat tamu |
| UC-13 | Search & Filter | Admin, Member | Pencarian real-time dengan multiple filters |
| UC-14 | Export Data | Admin | Export disposisi ke format Excel |
| UC-15 | Lihat Dashboard | Admin, Member, Tamu | Melihat statistik dan overview |

---

## 🔐 Authentication & Authorization

### Login Flow
```
User Input Credentials
    ↓
NextAuth.js Validation
    ↓
bcrypt Password Verification
    ↓
Rate Limit Check (5 attempts/15 min)
    ↓
Session Creation
    ↓
Role-based Redirect
    ├── ADMIN → /dashboard
    ├── MEMBER → /dashboard
    └── TAMU → /tamu/dashboard
```

### Authorization Matrix

| Feature | Admin | Member | Tamu |
|---------|-------|--------|------|
| Surat Masuk - View | ✅ | ✅ | ❌ |
| Surat Masuk - Create | ✅ | ❌ | ❌ |
| Surat Masuk - Edit | ✅ | ❌ | ❌ |
| Surat Masuk - Delete | ✅ | ❌ | ❌ |
| Surat Keluar - View | ✅ | ✅ | ❌ |
| Surat Keluar - Create | ✅ | ❌ | ❌ |
| Surat Keluar - Edit | ✅ | ❌ | ❌ |
| Surat Keluar - Delete | ✅ | ❌ | ❌ |
| Disposisi - View | ✅ | ✅ | ❌ |
| Disposisi - Create | ✅ | ❌ | ❌ |
| Disposisi - Edit | ✅ | ❌ | ❌ |
| Disposisi - Delete | ✅ | ❌ | ❌ |
| Disposisi - Export | ✅ | ❌ | ❌ |
| Surat Tamu - View | ✅ | ✅ | ❌ |
| Surat Tamu - Create | ✅ | ❌ | ❌ |
| Surat Tamu - Edit | ✅ | ❌ | ❌ |
| Surat Tamu - Delete | ✅ | ❌ | ❌ |
| User Management | ✅ | ❌ | ❌ |
| Audit Log | ✅ | ❌ | ❌ |
| Dashboard | ✅ | ✅ | ✅ (Tamu only) |
| Search & Filter | ✅ | ✅ | ❌ |

---

## 📱 System Boundaries

**Included in System:**
- Web-based application
- Database management
- User authentication & authorization
- CSRF protection & rate limiting
- Audit logging
- Excel export functionality
- Real-time search & filtering

**Excluded from System:**
- Email notifications
- SMS notifications
- Document scanning
- Physical document storage
- Mobile native applications
- Offline mode

---

## 🔄 System Integration Points

1. **NextAuth.js** - Authentication & Session Management
2. **Prisma ORM** - Database Operations
3. **PostgreSQL/Neon** - Database Server
4. **XLSX Library** - Excel Export
5. **Vercel** - Deployment & Hosting
6. **CSRF Token System** - Security Protection

---

**Dibuat pada**: 1 Desember 2025  
**Versi**: 1.0  
**Sistem**: Arsip DPRD Provinsi Kalimantan Selatan
