# Use Case Description - Sistem Manajemen Arsip DPRD Kalimantan Selatan

## UC-01: Login ke Sistem

**Actor**: Admin, Member, Tamu

**Precondition**: 
- User sudah memiliki akun yang terdaftar di sistem
- User berada di halaman login

**Postcondition**: 
- User berhasil terautentikasi
- Session dibuat
- User diarahkan ke dashboard sesuai role

**Main Flow**:
1. User membuka halaman login (`/login`, `/arsip/login`, atau `/tamu/login`)
2. System menampilkan form login
3. User memasukkan email dan password
4. User menekan tombol "Login"
5. System memvalidasi credentials
6. System memeriksa rate limit (max 5 attempts per 15 menit)
7. System memverifikasi password menggunakan bcrypt
8. System membuat session dengan NextAuth.js
9. System mencatat aktivitas login ke audit log
10. System redirect user ke dashboard sesuai role:
    - ADMIN → `/dashboard`
    - MEMBER → `/dashboard`
    - TAMU → `/tamu/dashboard`

**Alternative Flow**:
- **A1**: Email tidak ditemukan
  - System menampilkan error "Invalid credentials"
  - System mencatat failed login ke audit log
  - Return to step 3
  
- **A2**: Password salah
  - System menampilkan error "Invalid credentials"
  - System increment failed attempt counter
  - System mencatat failed login ke audit log
  - Return to step 3
  
- **A3**: Rate limit exceeded
  - System menampilkan error "Too many login attempts. Please try again in 15 minutes"
  - System block login attempts dari IP tersebut
  - End use case

**Security Measures**:
- Password hashing dengan bcrypt (12 rounds)
- Rate limiting (5 attempts/15 min)
- Audit logging untuk semua login attempts
- CSRF protection pada login form
- Session security (HttpOnly, Secure, SameSite cookies)

---

## UC-02: Kelola Surat Masuk

**Actor**: Admin

**Precondition**: 
- User sudah login sebagai Admin
- User berada di halaman Surat Masuk (`/dashboard/surat-masuk`)

**Postcondition**: 
- Data surat masuk berubah sesuai operasi
- Perubahan tercatat di audit log
- UI ter-update dengan data terbaru

### UC-02.1: Tambah Surat Masuk

**Main Flow**:
1. Admin klik tombol "Tambah Surat Masuk"
2. System menampilkan form input
3. Admin mengisi data:
   - No Urut (required, unique, number)
   - Nomor Surat (optional, unique jika diisi)
   - Tanggal Surat (required, date)
   - Tanggal Diteruskan (required, date)
   - Asal Surat (required, text)
   - Perihal (required, text)
   - Keterangan (optional, text)
   - File Path (optional, text)
4. Admin klik "Simpan"
5. System validasi input dengan Zod schema
6. System cek uniqueness noUrut dan nomorSurat
7. System simpan data ke database via Prisma
8. System catat aktivitas ke audit log
9. System tampilkan success message
10. System redirect ke halaman daftar surat masuk

**Alternative Flow**:
- **A1**: Validasi gagal
  - System tampilkan error message sesuai field
  - Return to step 3
  
- **A2**: No Urut sudah ada
  - System tampilkan error "No Urut sudah digunakan"
  - Return to step 3
  
- **A3**: Nomor Surat sudah ada
  - System tampilkan error "Nomor Surat sudah digunakan"
  - Return to step 3

### UC-02.2: Edit Surat Masuk

**Main Flow**:
1. Admin klik icon edit pada row surat masuk
2. System redirect ke halaman edit dengan data ter-populate
3. Admin mengubah data yang diperlukan
4. Admin klik "Simpan"
5. System validasi input
6. System cek uniqueness (exclude current record)
7. System update data di database
8. System catat perubahan ke audit log
9. System tampilkan success message
10. System redirect ke halaman daftar

**Alternative Flow**:
- **A1**: Surat masuk memiliki relasi (disposisi/surat keluar)
  - System tetap izinkan edit
  - System cascade update jika perlu
  
- **A2**: Validasi gagal
  - System tampilkan error message
  - Return to step 3

### UC-02.3: Hapus Surat Masuk

**Main Flow**:
1. Admin klik icon delete pada row surat masuk
2. System tampilkan confirmation dialog
3. Admin konfirmasi penghapusan
4. System cek relasi dengan tabel lain
5. System hapus data dengan cascade delete
6. System catat penghapusan ke audit log
7. System tampilkan success message
8. System refresh daftar surat masuk

**Alternative Flow**:
- **A1**: Admin cancel konfirmasi
  - End use case
  
- **A2**: Terjadi error saat delete
  - System tampilkan error message
  - Data tidak terhapus

### UC-02.4: Search & Filter Surat Masuk

**Main Flow**:
1. Admin memilih search field dari dropdown:
   - No Urut (default)
   - No Surat
   - Asal Surat
   - Perihal
2. Admin mengetik keyword di search box
3. System melakukan debounce 300ms
4. System kirim request ke API dengan parameter search dan searchField
5. System query database sesuai field yang dipilih:
   - No Urut: exact match (integer)
   - No Surat: contains, case-insensitive
   - Asal Surat: contains, case-insensitive
   - Perihal: contains, case-insensitive
6. System tampilkan hasil pencarian
7. System reset pagination ke halaman 1

**Additional Filters**:
- **Filter by Date**: Admin pilih tanggal specific
- **Filter by Month**: Admin pilih bulan dari dropdown
- **Kombinasi filters**: System support multiple filters bersamaan

---

## UC-03: Kelola Surat Keluar

**Actor**: Admin

**Precondition**: 
- User sudah login sebagai Admin
- User berada di halaman Surat Keluar

**Postcondition**: 
- Data surat keluar berubah sesuai operasi
- Icon status ter-update jika terkait surat masuk
- Audit log tercatat

### UC-03.1: Tambah Surat Keluar Manual

**Main Flow**:
1. Admin klik "Tambah Surat Keluar"
2. System tampilkan form input
3. Admin mengisi:
   - No Urut (required, unique, auto-suggest next number)
   - Klas Surat (required)
   - Pengolah (required, dropdown: Ketua DPRD, Wakil 1-3, SEKWAN)
   - Tanggal Surat (required)
   - Perihal Surat (required)
   - Kirim Kepada (required)
4. Admin klik "Simpan"
5. System validasi dan simpan
6. System catat ke audit log
7. System tampilkan success message

### UC-03.2: Buat Surat Keluar dari Surat Masuk

**Main Flow**:
1. Admin klik icon "Buat Surat Keluar" di row surat masuk
2. System buka modal form surat keluar
3. System auto-populate noUrut dari surat masuk
4. Admin mengisi field lainnya:
   - Klas Surat
   - Pengolah
   - Perihal Surat
   - Kirim Kepada
5. Admin klik "Buat Surat Keluar"
6. System simpan dengan relasi ke surat masuk (suratMasukId)
7. System update icon surat masuk menjadi "has surat keluar"
8. System catat ke audit log
9. System tampilkan success message

**Alternative Flow**:
- **A1**: Surat masuk sudah memiliki surat keluar
  - System tetap izinkan membuat surat keluar baru
  - System tampilkan warning

---

## UC-04: Kelola Disposisi

**Actor**: Admin

**Precondition**: 
- User sudah login sebagai Admin

**Postcondition**: 
- Data disposisi ter-manage
- Statistik pending disposisi ter-update

### UC-04.1: Tambah Disposisi Manual

**Main Flow**:
1. Admin klik "Tambah Disposisi"
2. System tampilkan form
3. Admin mengisi:
   - Nomor Disposisi (optional, unique)
   - No Urut (required, harus sesuai dengan surat masuk)
   - Tanggal Disposisi (required)
   - Tujuan Disposisi (required, dropdown)
   - Isi Disposisi (required, auto-template)
   - Keterangan (optional)
   - Pilih Surat Masuk (required, dropdown)
4. System validasi noUrut dengan surat masuk
5. System simpan dengan status "SELESAI"
6. System catat ke audit log

**Tujuan Disposisi Options**:
- Pimpinan DPRD
- SEKWAN
- RTA
- Persidangan
- Keuangan
- Fraksi

### UC-04.2: Copy Surat Masuk ke Disposisi

**Main Flow**:
1. Admin klik icon "Copy to Disposisi" di row surat masuk
2. System buka modal selection
3. System tampilkan pilihan tujuan disposisi
4. Admin pilih tujuan
5. Admin klik "Copy"
6. System auto-populate:
   - NoUrut dari surat masuk
   - Tanggal disposisi (hari ini)
   - Isi disposisi (template based on tujuan)
   - SuratMasukId (relasi)
7. System simpan disposisi
8. System update icon surat masuk
9. System catat ke audit log

### UC-04.3: Export Disposisi ke Excel

**Main Flow**:
1. Admin klik "Export to Excel"
2. System query semua data disposisi dengan join ke surat masuk
3. System generate Excel file dengan XLSX library
4. System format columns:
   - No Urut
   - Nomor Disposisi
   - Tanggal Disposisi
   - Asal Surat
   - Perihal Surat
   - Tujuan Disposisi
   - Isi Disposisi
   - Status
5. System download file ke browser
6. System catat aktivitas export ke audit log

---

## UC-05: Kelola User

**Actor**: Admin

**Precondition**: 
- User login sebagai Admin
- User di halaman User Management

**Postcondition**: 
- Data user berubah
- Audit log tercatat

### UC-05.1: Tambah User Baru

**Main Flow**:
1. Admin klik "Tambah User"
2. System tampilkan form
3. Admin mengisi:
   - Name (required)
   - Email (required, unique, format email)
   - Password (required, min 8 char, kompleks)
   - Role (required, dropdown: ADMIN/MEMBER)
4. Admin klik "Simpan"
5. System validasi password policy:
   - Min 8 karakter
   - Harus ada uppercase
   - Harus ada lowercase
   - Harus ada number
   - Harus ada special character
6. System hash password dengan bcrypt (12 rounds)
7. System simpan ke database
8. System catat ke audit log
9. System tampilkan success message

**Alternative Flow**:
- **A1**: Email sudah digunakan
  - System tampilkan error "Email sudah terdaftar"
  - Return to step 3
  
- **A2**: Password tidak memenuhi policy
  - System tampilkan error detail requirement
  - Return to step 3

### UC-05.2: Edit User

**Main Flow**:
1. Admin klik icon edit pada user
2. System tampilkan form dengan data existing
3. Admin mengubah data (name, email, atau role)
4. Admin klik "Simpan"
5. System validasi input
6. System update data
7. System catat ke audit log
8. System tampilkan success message

**Note**: Password tidak dapat diedit melalui edit user (harus reset password terpisah)

### UC-05.3: Hapus User

**Main Flow**:
1. Admin klik icon delete
2. System tampilkan confirmation
3. Admin konfirmasi
4. System cek apakah user memiliki data terkait
5. System tampilkan warning jika ada relasi
6. Admin konfirmasi final
7. System soft delete atau cascade delete sesuai policy
8. System catat ke audit log
9. System refresh daftar user

---

## UC-06: Monitor Audit Log

**Actor**: Admin

**Precondition**: 
- User login sebagai Admin
- User di halaman Audit Logs

**Postcondition**: 
- Admin mendapat insight tentang aktivitas sistem

**Main Flow**:
1. Admin akses halaman Audit Logs
2. System tampilkan daftar log dengan pagination
3. System tampilkan informasi:
   - Timestamp
   - User (name & email)
   - Action (LOGIN, LOGOUT, CREATE, UPDATE, DELETE, FAILED_LOGIN)
   - Entity (User, SuratMasuk, Disposisi, etc)
   - Entity ID
   - IP Address
   - User Agent
   - Success status
   - Details (JSON)
4. Admin dapat filter by:
   - Action type
   - Entity type
   - Date range
   - User
   - Success/Failure
5. System tampilkan hasil filter

**Logged Actions**:
- **Authentication**: LOGIN, LOGOUT, FAILED_LOGIN
- **User Management**: CREATE_USER, UPDATE_USER, DELETE_USER
- **Surat Masuk**: CREATE_SURAT_MASUK, UPDATE_SURAT_MASUK, DELETE_SURAT_MASUK
- **Surat Keluar**: CREATE_SURAT_KELUAR, UPDATE_SURAT_KELUAR, DELETE_SURAT_KELUAR
- **Disposisi**: CREATE_DISPOSISI, UPDATE_DISPOSISI, DELETE_DISPOSISI, EXPORT_DISPOSISI
- **Surat Tamu**: CREATE_SURAT_TAMU, UPDATE_SURAT_TAMU, DELETE_SURAT_TAMU

---

## UC-07: Lihat Dashboard Statistik

**Actor**: Admin, Member, Tamu

**Precondition**: 
- User sudah login

**Postcondition**: 
- User melihat overview sistem

### Dashboard Admin/Member

**Main Flow**:
1. User login dan redirect ke dashboard
2. System query statistik:
   - Total Surat Masuk (count all)
   - Total Surat Keluar (count all)
   - Total Disposisi (count all)
   - Pending Disposisi (surat masuk - disposisi selesai)
3. System tampilkan dalam card statistics
4. System tampilkan grafik/chart (jika ada)
5. System tampilkan quick actions based on role

**Dashboard Tamu**

**Main Flow**:
1. Tamu login
2. System redirect ke `/tamu/dashboard`
3. System tampilkan:
   - Informasi DPRD Kalimantan Selatan
   - Jam operasional
   - Kontak informasi
4. Tamu tidak dapat akses menu lain

---

## UC-08: Kelola Surat Tamu

**Actor**: Admin

**Precondition**: 
- User login sebagai Admin
- User di halaman Surat Tamu

**Postcondition**: 
- Data kunjungan tamu tercatat

### UC-08.1: Tambah Surat Tamu

**Main Flow**:
1. Admin klik "Tambah Surat Tamu"
2. System tampilkan form
3. Admin mengisi:
   - No Urut (required, unique, auto-suggest)
   - Nama (required)
   - Keperluan (required)
   - Asal Surat (required)
   - Tujuan Surat (required)
   - Nomor Telepon (optional)
   - Tanggal (required, default hari ini)
4. Admin klik "Simpan"
5. System validasi dan simpan
6. System catat ke audit log
7. System tampilkan success message

---

## 🔒 Security Use Cases

### UC-SEC-01: CSRF Protection

**Automatic Flow**:
1. User akses aplikasi
2. System generate CSRF token
3. System set token di cookie (double submit pattern)
4. Frontend otomatis include token di setiap request
5. Backend validate token di setiap mutation
6. System reject request jika token invalid/missing

### UC-SEC-02: Rate Limiting

**Automatic Flow**:
1. User melakukan action (login/API call)
2. System track request count per IP
3. System increment counter
4. System cek threshold:
   - Login: 5 requests / 15 minutes
   - API: 100 requests / 15 minutes
5. System block request jika exceed limit
6. System return 429 Too Many Requests

### UC-SEC-03: Session Management

**Automatic Flow**:
1. User login berhasil
2. System create session dengan NextAuth
3. System set secure cookie:
   - HttpOnly: true
   - Secure: true (production)
   - SameSite: 'lax'
4. Session expires after inactivity
5. System auto refresh token sebelum expire
6. Logout menghapus session

---

**Dibuat pada**: 1 Desember 2025  
**Versi**: 1.0  
**Sistem**: Arsip DPRD Provinsi Kalimantan Selatan
