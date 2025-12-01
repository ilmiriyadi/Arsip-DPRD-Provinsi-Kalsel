# CDM (Conceptual Data Model) - Sistem Manajemen Arsip DPRD Kalimantan Selatan

## 📊 Conceptual Data Model

Conceptual Data Model (CDM) menggambarkan struktur data sistem secara konseptual tanpa detail teknis implementasi database.

---

## 🎯 Entitas dan Relasi

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CONCEPTUAL DATA MODEL                                │
└─────────────────────────────────────────────────────────────────────────────┘


    ┌──────────────────┐
    │      USER        │
    │                  │
    │  • id            │
    │  • email         │
    │  • name          │
    │  • password      │
    │  • role          │
    │  • createdAt     │
    │  • updatedAt     │
    └────────┬─────────┘
             │
             │ creates (1:N)
             │
             ├──────────────────────────┐
             │                          │
             │                          │
             ▼                          ▼
    ┌──────────────────┐      ┌──────────────────┐
    │  SURAT_MASUK     │      │  SURAT_KELUAR    │
    │                  │      │                  │
    │  • id            │      │  • id            │
    │  • noUrut        │      │  • noUrut        │
    │  • nomorSurat    │      │  • klas          │
    │  • tanggalSurat  │      │  • pengolah      │
    │  • tanggalDiter  │      │  • tanggalSurat  │
    │  • asalSurat     │      │  • perihalSurat  │
    │  • perihal       │      │  • kirimKepada   │
    │  • keterangan    │      │  • createdAt     │
    │  • filePath      │      │  • updatedAt     │
    │  • createdAt     │      └──────────────────┘
    │  • updatedAt     │               ▲
    └────────┬─────────┘               │
             │                         │
             │                         │ relates to (N:1, optional)
             │                         │
             ├─────────────────────────┘
             │
             │ has (1:N)
             │
             ▼
    ┌──────────────────┐
    │   DISPOSISI      │
    │                  │
    │  • id            │
    │  • nomorDisp     │
    │  • noUrut        │
    │  • tanggalDisp   │
    │  • tujuanDisp    │
    │  • isiDisposisi  │
    │  • keterangan    │
    │  • status        │
    │  • createdAt     │
    │  • updatedAt     │
    └──────────────────┘


    ┌──────────────────┐
    │   SURAT_TAMU     │
    │                  │
    │  • id            │
    │  • noUrut        │
    │  • nama          │
    │  • keperluan     │
    │  • asalSurat     │
    │  • tujuanSurat   │
    │  • nomorTelpon   │
    │  • tanggal       │
    │  • createdAt     │
    │  • updatedAt     │
    └────────┬─────────┘
             ▲
             │
             │ creates (N:1)
             │
             └─── (dari USER)


    ┌──────────────────┐
    │   AUDIT_LOG      │
    │                  │
    │  • id            │
    │  • userId        │
    │  • action        │
    │  • entity        │
    │  • entityId      │
    │  • ipAddress     │
    │  • userAgent     │
    │  • details       │
    │  • success       │
    │  • createdAt     │
    └──────────────────┘
             ▲
             │
             │ logs (N:1, optional)
             │
             └─── (dari USER)
```

---

## 📋 Deskripsi Entitas

### 1. USER
**Deskripsi**: Entitas yang merepresentasikan pengguna sistem dengan berbagai role.

**Atribut**:
- `id`: Identifier unik pengguna
- `email`: Alamat email pengguna (unique)
- `name`: Nama lengkap pengguna
- `password`: Password terenkripsi
- `role`: Peran pengguna (ADMIN/MEMBER)
- `createdAt`: Waktu pembuatan akun
- `updatedAt`: Waktu update terakhir

**Business Rules**:
- Email harus unique
- Password harus memenuhi policy (min 8 char, kompleks)
- Role default adalah MEMBER
- User pertama yang register otomatis menjadi ADMIN

---

### 2. SURAT_MASUK
**Deskripsi**: Entitas yang merepresentasikan surat masuk yang diterima DPRD.

**Atribut**:
- `id`: Identifier unik surat masuk
- `noUrut`: Nomor urut surat (unique)
- `nomorSurat`: Nomor resmi surat (optional, unique)
- `tanggalSurat`: Tanggal surat dibuat
- `tanggalDiteruskan`: Tanggal surat diteruskan
- `asalSurat`: Asal/pengirim surat
- `perihal`: Perihal/isi ringkas surat
- `keterangan`: Keterangan tambahan
- `filePath`: Path file dokumen
- `createdAt`: Waktu pencatatan
- `updatedAt`: Waktu update terakhir

**Business Rules**:
- noUrut harus unique
- nomorSurat harus unique jika diisi
- tanggalSurat tidak boleh lebih besar dari tanggalDiteruskan
- asalSurat dan perihal mandatory

---

### 3. SURAT_KELUAR
**Deskripsi**: Entitas yang merepresentasikan surat keluar yang diterbitkan DPRD.

**Atribut**:
- `id`: Identifier unik surat keluar
- `noUrut`: Nomor urut surat (unique)
- `klas`: Klasifikasi surat
- `pengolah`: Pejabat pengolah surat
- `tanggalSurat`: Tanggal surat dibuat
- `perihalSurat`: Perihal surat
- `kirimKepada`: Tujuan pengiriman surat
- `createdAt`: Waktu pembuatan
- `updatedAt`: Waktu update terakhir

**Business Rules**:
- noUrut harus unique
- Dapat dibuat manual atau dari surat masuk
- pengolah harus dari list yang ditentukan (Ketua DPRD, Wakil 1-3, SEKWAN)

---

### 4. DISPOSISI
**Deskripsi**: Entitas yang merepresentasikan disposisi atas surat masuk.

**Atribut**:
- `id`: Identifier unik disposisi
- `nomorDisposisi`: Nomor resmi disposisi (optional, unique)
- `noUrut`: Nomor urut sesuai surat masuk
- `tanggalDisposisi`: Tanggal disposisi dibuat
- `tujuanDisposisi`: Tujuan disposisi
- `isiDisposisi`: Isi/instruksi disposisi
- `keterangan`: Keterangan tambahan
- `status`: Status disposisi (SELESAI)
- `createdAt`: Waktu pembuatan
- `updatedAt`: Waktu update terakhir

**Business Rules**:
- noUrut harus sesuai dengan surat masuk terkait
- Setiap disposisi must relate to surat masuk
- Default status adalah SELESAI
- Dapat dibuat manual atau copy dari surat masuk

---

### 5. SURAT_TAMU
**Deskripsi**: Entitas yang merepresentasikan kunjungan tamu ke DPRD.

**Atribut**:
- `id`: Identifier unik surat tamu
- `noUrut`: Nomor urut kunjungan (unique)
- `nama`: Nama pengunjung
- `keperluan`: Keperluan kunjungan
- `asalSurat`: Asal instansi/organisasi
- `tujuanSurat`: Tujuan kunjungan
- `nomorTelpon`: Nomor telepon pengunjung
- `tanggal`: Tanggal kunjungan
- `createdAt`: Waktu pencatatan
- `updatedAt`: Waktu update terakhir

**Business Rules**:
- noUrut harus unique
- nama, keperluan, asalSurat, tujuanSurat mandatory
- nomorTelpon optional

---

### 6. AUDIT_LOG
**Deskripsi**: Entitas yang merepresentasikan log aktivitas sistem untuk audit dan security.

**Atribut**:
- `id`: Identifier unik log
- `userId`: ID user yang melakukan aksi (nullable untuk failed login)
- `action`: Jenis aksi yang dilakukan
- `entity`: Entitas yang terpengaruh
- `entityId`: ID entitas yang terpengaruh
- `ipAddress`: IP address user
- `userAgent`: Browser/device info user
- `details`: Detail tambahan (JSON)
- `success`: Status keberhasilan aksi
- `createdAt`: Waktu kejadian

**Business Rules**:
- Semua aktivitas penting harus di-log
- userId nullable untuk kasus failed login
- Retention policy: keep logs for audit purposes

---

## 🔗 Relasi Antar Entitas

### 1. USER → SURAT_MASUK (1:N)
**Jenis**: One-to-Many (Mandatory)

**Deskripsi**: Satu user (admin) dapat membuat banyak surat masuk, tapi setiap surat masuk harus dibuat oleh satu user.

**Cardinality**: 
- USER: 1 (one)
- SURAT_MASUK: N (many)

**Delete Rule**: RESTRICT (tidak bisa hapus user yang punya surat masuk)

---

### 2. USER → SURAT_KELUAR (1:N)
**Jenis**: One-to-Many (Mandatory)

**Deskripsi**: Satu user dapat membuat banyak surat keluar, tapi setiap surat keluar harus dibuat oleh satu user.

**Cardinality**: 
- USER: 1
- SURAT_KELUAR: N

**Delete Rule**: RESTRICT

---

### 3. USER → DISPOSISI (1:N)
**Jenis**: One-to-Many (Mandatory)

**Deskripsi**: Satu user dapat membuat banyak disposisi, tapi setiap disposisi harus dibuat oleh satu user.

**Cardinality**: 
- USER: 1
- DISPOSISI: N

**Delete Rule**: RESTRICT

---

### 4. USER → SURAT_TAMU (1:N)
**Jenis**: One-to-Many (Mandatory)

**Deskripsi**: Satu user dapat mencatat banyak surat tamu, tapi setiap surat tamu harus dicatat oleh satu user.

**Cardinality**: 
- USER: 1
- SURAT_TAMU: N

**Delete Rule**: RESTRICT

---

### 5. SURAT_MASUK → DISPOSISI (1:N)
**Jenis**: One-to-Many (Mandatory)

**Deskripsi**: Satu surat masuk dapat memiliki banyak disposisi, tapi setiap disposisi harus terkait dengan satu surat masuk.

**Cardinality**: 
- SURAT_MASUK: 1
- DISPOSISI: N (0 atau lebih)

**Delete Rule**: CASCADE (jika surat masuk dihapus, disposisi terkait ikut terhapus)

---

### 6. SURAT_MASUK → SURAT_KELUAR (1:N)
**Jenis**: One-to-Many (Optional)

**Deskripsi**: Satu surat masuk dapat menghasilkan banyak surat keluar, tapi surat keluar bisa dibuat tanpa surat masuk (manual).

**Cardinality**: 
- SURAT_MASUK: 0..1 (optional)
- SURAT_KELUAR: N

**Delete Rule**: SET NULL (jika surat masuk dihapus, relasi di surat keluar di-set null)

---

### 7. USER → AUDIT_LOG (1:N)
**Jenis**: One-to-Many (Optional)

**Deskripsi**: Satu user dapat memiliki banyak log aktivitas, tapi log bisa ada tanpa user (failed login).

**Cardinality**: 
- USER: 0..1 (optional)
- AUDIT_LOG: N

**Delete Rule**: SET NULL (jika user dihapus, userId di log di-set null untuk histori)

---

## 📊 Kardinalitas Summary

| Relasi | Parent | Child | Cardinality | Mandatory |
|--------|--------|-------|-------------|-----------|
| User-SuratMasuk | User | SuratMasuk | 1:N | Yes |
| User-SuratKeluar | User | SuratKeluar | 1:N | Yes |
| User-Disposisi | User | Disposisi | 1:N | Yes |
| User-SuratTamu | User | SuratTamu | 1:N | Yes |
| User-AuditLog | User | AuditLog | 1:N | No |
| SuratMasuk-Disposisi | SuratMasuk | Disposisi | 1:N | Yes (child) |
| SuratMasuk-SuratKeluar | SuratMasuk | SuratKeluar | 1:N | No |

---

## 🎯 Domain Values (Enumerations)

### Role
Mendefinisikan peran pengguna dalam sistem.

**Values**:
- `ADMIN`: Administrator dengan full access
- `MEMBER`: Member dengan read-only access

**Default**: MEMBER

---

### StatusDisposisi
Mendefinisikan status penyelesaian disposisi.

**Values**:
- `SELESAI`: Disposisi sudah selesai diproses

**Default**: SELESAI

**Note**: Saat ini hanya ada 1 status, tapi bisa dikembangkan untuk: PENDING, PROSES, SELESAI, BATAL

---

### PengolahSurat
Mendefinisikan pejabat yang mengolah surat keluar.

**Values**:
- `KETUA_DPRD`: Ketua DPRD
- `WAKIL_KETUA_1`: Wakil Ketua 1
- `WAKIL_KETUA_2`: Wakil Ketua 2
- `WAKIL_KETUA_3`: Wakil Ketua 3
- `SEKWAN`: Sekretaris Dewan

---

## 🔍 Business Rules Summary

### Global Rules
1. Setiap entitas harus memiliki identifier unik (id)
2. Setiap entitas harus memiliki timestamp (createdAt, updatedAt)
3. Setiap data transaction harus dicatat di audit log
4. User yang membuat data harus tercatat (createdBy)

### Unique Constraints
- User.email must be unique
- SuratMasuk.noUrut must be unique
- SuratMasuk.nomorSurat must be unique (if provided)
- Disposisi.nomorDisposisi must be unique (if provided)
- SuratKeluar.noUrut must be unique
- SuratTamu.noUrut must be unique

### Referential Integrity
- Semua foreign key harus valid (kecuali nullable)
- Delete rules harus ditegakkan
- Cascade delete untuk parent-child yang tightly coupled
- Restrict delete untuk data yang sudah referenced

### Data Validation
- Email harus format valid
- Password harus memenuhi complexity requirements
- Tanggal harus valid dan logical
- noUrut harus positive integer

---

## 📈 Extensibility

Model ini dirancang untuk mudah dikembangkan:

### Possible Extensions
1. **Multi-status Disposisi**: Tambah PENDING, PROSES, BATAL
2. **File Attachments**: Entitas terpisah untuk manage uploads
3. **Notifications**: Entitas untuk notifikasi real-time
4. **Comments/Notes**: Entitas untuk kolaborasi
5. **Document Versioning**: Track perubahan dokumen
6. **Workflow Engine**: Approval flow yang kompleks
7. **Categories/Tags**: Klasifikasi surat yang lebih detail
8. **Calendar Integration**: Integrasi dengan agenda rapat

---

**Dibuat pada**: 1 Desember 2025  
**Versi**: 1.0  
**Sistem**: Arsip DPRD Provinsi Kalimantan Selatan  
**Notasi**: Conceptual Data Model (CDM) - High Level Entity Relationship
