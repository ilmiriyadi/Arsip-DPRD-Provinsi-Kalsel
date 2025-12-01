# Struktur Tabel Database - Sistem Manajemen Arsip DPRD Kalimantan Selatan

## 📊 Database Structure Documentation

Dokumentasi lengkap struktur tabel dengan deskripsi detail setiap field, constraint, relasi, dan business rules.

**Database**: PostgreSQL 14.x (Neon Serverless)  
**Total Tables**: 6  
**ORM**: Prisma 6.17.0

---

## 📋 Table of Contents

1. [Table: users](#1-table-users)
2. [Table: surat_masuk](#2-table-surat_masuk)
3. [Table: disposisi](#3-table-disposisi)
4. [Table: surat_keluar](#4-table-surat_keluar)
5. [Table: surat_tamu](#5-table-surat_tamu)
6. [Table: audit_logs](#6-table-audit_logs)
7. [Relationship Summary](#relationship-summary)
8. [Data Dictionary](#data-dictionary)

---

## 1. Table: users

**Purpose**: Menyimpan informasi akun pengguna sistem dengan role-based access control.

**Table Name**: `users`  
**Primary Key**: `id`  
**Indexes**: 3 (1 primary, 1 unique, 1 non-clustered)

### Struktur Kolom

| No | Column Name | Type | Length | Null | Default | PK | FK | UK | Description |
|----|-------------|------|--------|------|---------|----|----|----|-----------| 
| 1 | id | TEXT | 25 | NO | auto | ✅ | - | ✅ | CUID - Primary key unik |
| 2 | email | VARCHAR | 255 | NO | - | - | - | ✅ | Email untuk login (unique) |
| 3 | name | VARCHAR | 100 | YES | NULL | - | - | - | Nama lengkap user |
| 4 | password | VARCHAR | 60 | NO | - | - | - | - | Password hash bcrypt |
| 5 | role | VARCHAR | 10 | NO | 'MEMBER' | - | - | - | Role: ADMIN atau MEMBER |
| 6 | created_at | TIMESTAMP(3) | - | NO | now() | - | - | - | Waktu pembuatan record |
| 7 | updated_at | TIMESTAMP(3) | - | NO | now() | - | - | - | Waktu update terakhir |

### Constraints

| Constraint Name | Type | Columns | Description |
|----------------|------|---------|-------------|
| users_pkey | PRIMARY KEY | id | Primary key constraint |
| users_email_unique | UNIQUE | email | Email harus unik |
| users_role_check | CHECK | role | role IN ('ADMIN', 'MEMBER') |

### Indexes

| Index Name | Type | Columns | Description |
|-----------|------|---------|-------------|
| users_id_key | UNIQUE | id | Primary key index |
| users_email_key | UNIQUE | email | Unique email index untuk login cepat |
| users_role_idx | INDEX | role | Index untuk filter by role |

### Business Rules

1. **Email Uniqueness**: Email harus unique di seluruh sistem
2. **Password Security**: Password harus di-hash menggunakan bcrypt dengan 12 rounds
3. **Password Policy**: 
   - Minimum 8 karakter
   - Harus ada uppercase letter
   - Harus ada lowercase letter
   - Harus ada number
   - Harus ada special character
4. **Default Role**: User baru default role MEMBER
5. **First User**: User pertama yang register otomatis menjadi ADMIN

### Sample Data

```sql
INSERT INTO users (id, email, name, password, role) VALUES
('clv1a2b3c4d5e6f7g8h9', 'admin@dprdkalsel.go.id', 'Administrator', '$2a$12$...hash...', 'ADMIN'),
('clv2b3c4d5e6f7g8h9i0', 'member@dprdkalsel.go.id', 'Member User', '$2a$12$...hash...', 'MEMBER');
```

---

## 2. Table: surat_masuk

**Purpose**: Menyimpan data surat masuk yang diterima oleh DPRD Kalimantan Selatan.

**Table Name**: `surat_masuk`  
**Primary Key**: `id`  
**Foreign Keys**: 1 (users)  
**Indexes**: 7

### Struktur Kolom

| No | Column Name | Type | Length | Null | Default | PK | FK | UK | Description |
|----|-------------|------|--------|------|---------|----|----|----|-----------| 
| 1 | id | TEXT | 25 | NO | auto | ✅ | - | ✅ | CUID - Primary key |
| 2 | no_urut | INTEGER | - | NO | - | - | - | ✅ | Nomor urut surat (unique) |
| 3 | nomor_surat | VARCHAR | 50 | YES | NULL | - | - | ✅* | Nomor resmi surat (optional, unique) |
| 4 | tanggal_surat | TIMESTAMP(3) | - | NO | - | - | - | - | Tanggal surat dibuat |
| 5 | tanggal_diteruskan | TIMESTAMP(3) | - | NO | - | - | - | - | Tanggal surat diteruskan |
| 6 | asal_surat | VARCHAR | 200 | NO | - | - | - | - | Asal/pengirim surat |
| 7 | perihal | TEXT | 500 | NO | - | - | - | - | Perihal/subjek surat |
| 8 | keterangan | TEXT | 1000 | YES | NULL | - | - | - | Keterangan tambahan |
| 9 | file_path | VARCHAR | 500 | YES | NULL | - | - | - | Path file dokumen |
| 10 | created_at | TIMESTAMP(3) | - | NO | now() | - | - | - | Waktu pencatatan |
| 11 | updated_at | TIMESTAMP(3) | - | NO | now() | - | - | - | Waktu update terakhir |
| 12 | created_by_id | TEXT | 25 | NO | - | - | ✅ | - | FK ke users.id (creator) |

*UK (Unique Key) conditional: hanya jika nilai tidak NULL

### Constraints

| Constraint Name | Type | Columns | Description |
|----------------|------|---------|-------------|
| surat_masuk_pkey | PRIMARY KEY | id | Primary key |
| surat_masuk_no_urut_unique | UNIQUE | no_urut | No urut harus unik |
| surat_masuk_nomor_surat_unique | UNIQUE | nomor_surat | Nomor surat harus unik (if not null) |
| surat_masuk_no_urut_positive | CHECK | no_urut | no_urut > 0 |
| surat_masuk_dates_logical | CHECK | tanggal_surat, tanggal_diteruskan | tanggal_surat <= tanggal_diteruskan |
| surat_masuk_created_by_fk | FOREIGN KEY | created_by_id | REFERENCES users(id) ON DELETE RESTRICT |

### Indexes

| Index Name | Type | Columns | Description |
|-----------|------|---------|-------------|
| surat_masuk_id_key | UNIQUE | id | Primary key index |
| surat_masuk_no_urut_key | UNIQUE | no_urut | Quick lookup by no urut |
| surat_masuk_nomor_surat_key | UNIQUE (filtered) | nomor_surat | Where nomor_surat IS NOT NULL |
| surat_masuk_tanggal_surat_idx | INDEX (DESC) | tanggal_surat | Untuk sorting dan filter tanggal |
| surat_masuk_asal_surat_idx | INDEX | asal_surat | Search by asal surat |
| surat_masuk_perihal_idx | GIN | perihal | Full-text search |
| surat_masuk_created_by_id_idx | INDEX | created_by_id | FK index untuk joins |

### Business Rules

1. **No Urut Uniqueness**: No urut harus unik dan sequential
2. **Nomor Surat Optional**: Nomor surat boleh kosong, tapi jika diisi harus unique
3. **Date Validation**: Tanggal surat tidak boleh lebih besar dari tanggal diteruskan
4. **Mandatory Fields**: asal_surat dan perihal wajib diisi
5. **Search Fields**: Sistem support search by:
   - No Urut (exact match)
   - Nomor Surat (contains, case-insensitive)
   - Asal Surat (contains, case-insensitive)
   - Perihal (contains, case-insensitive)

### Relationships

- **1:N dengan disposisi**: Satu surat masuk bisa punya banyak disposisi
- **1:N dengan surat_keluar**: Satu surat masuk bisa generate banyak surat keluar
- **N:1 dengan users**: Banyak surat masuk dibuat oleh satu user

### Sample Data

```sql
INSERT INTO surat_masuk (id, no_urut, nomor_surat, tanggal_surat, tanggal_diteruskan, asal_surat, perihal, created_by_id) VALUES
('sm001', 1, 'SM/001/2025', '2025-12-01', '2025-12-01', 'Pemerintah Provinsi Kalsel', 'Undangan Rapat Koordinasi', 'admin_id');
```

---

## 3. Table: disposisi

**Purpose**: Menyimpan data disposisi/instruksi atas surat masuk.

**Table Name**: `disposisi`  
**Primary Key**: `id`  
**Foreign Keys**: 2 (surat_masuk, users)  
**Indexes**: 8

### Struktur Kolom

| No | Column Name | Type | Length | Null | Default | PK | FK | UK | Description |
|----|-------------|------|--------|------|---------|----|----|----|-----------| 
| 1 | id | TEXT | 25 | NO | auto | ✅ | - | ✅ | CUID - Primary key |
| 2 | nomor_disposisi | VARCHAR | 50 | YES | NULL | - | - | ✅* | Nomor resmi disposisi (optional, unique) |
| 3 | no_urut | INTEGER | - | NO | - | - | - | - | No urut dari surat masuk terkait |
| 4 | tanggal_disposisi | TIMESTAMP(3) | - | NO | - | - | - | - | Tanggal disposisi dibuat |
| 5 | tujuan_disposisi | VARCHAR | 200 | NO | - | - | - | - | Tujuan disposisi |
| 6 | isi_disposisi | TEXT | 2000 | NO | - | - | - | - | Isi/instruksi disposisi |
| 7 | keterangan | TEXT | 1000 | YES | NULL | - | - | - | Keterangan tambahan |
| 8 | status | VARCHAR | 10 | NO | 'SELESAI' | - | - | - | Status disposisi |
| 9 | created_at | TIMESTAMP(3) | - | NO | now() | - | - | - | Waktu pembuatan |
| 10 | updated_at | TIMESTAMP(3) | - | NO | now() | - | - | - | Waktu update terakhir |
| 11 | surat_masuk_id | TEXT | 25 | NO | - | - | ✅ | - | FK ke surat_masuk.id |
| 12 | created_by_id | TEXT | 25 | NO | - | - | ✅ | - | FK ke users.id |

### Constraints

| Constraint Name | Type | Columns | Description |
|----------------|------|---------|-------------|
| disposisi_pkey | PRIMARY KEY | id | Primary key |
| disposisi_nomor_disposisi_unique | UNIQUE | nomor_disposisi | Nomor disposisi unique (if not null) |
| disposisi_no_urut_positive | CHECK | no_urut | no_urut > 0 |
| disposisi_status_check | CHECK | status | status IN ('SELESAI') |
| disposisi_surat_masuk_fk | FOREIGN KEY | surat_masuk_id | REFERENCES surat_masuk(id) ON DELETE CASCADE |
| disposisi_created_by_fk | FOREIGN KEY | created_by_id | REFERENCES users(id) ON DELETE RESTRICT |

### Indexes

| Index Name | Type | Columns | Description |
|-----------|------|---------|-------------|
| disposisi_id_key | UNIQUE | id | Primary key index |
| disposisi_nomor_disposisi_key | UNIQUE (filtered) | nomor_disposisi | Where nomor_disposisi IS NOT NULL |
| disposisi_no_urut_idx | INDEX | no_urut | Search by no urut |
| disposisi_tanggal_disposisi_idx | INDEX (DESC) | tanggal_disposisi | Sort by date |
| disposisi_status_idx | INDEX | status | Filter by status |
| disposisi_tujuan_disposisi_idx | INDEX | tujuan_disposisi | Filter by tujuan |
| disposisi_surat_masuk_id_idx | INDEX | surat_masuk_id | FK join optimization |
| disposisi_created_by_id_idx | INDEX | created_by_id | FK join optimization |

### Business Rules

1. **Auto NoUrut Sync**: NoUrut disposisi otomatis sync dengan surat masuk terkait
2. **Mandatory Relation**: Setiap disposisi HARUS terkait dengan surat masuk
3. **Default Status**: Status default adalah SELESAI
4. **Tujuan Disposisi Options**:
   - Pimpinan DPRD
   - SEKWAN
   - RTA
   - Persidangan
   - Keuangan
   - Fraksi
5. **Auto Template**: Isi disposisi dapat auto-generate berdasarkan template tujuan
6. **Cascade Delete**: Jika surat masuk dihapus, disposisi terkait ikut terhapus

### Relationships

- **N:1 dengan surat_masuk**: Banyak disposisi untuk satu surat masuk
- **N:1 dengan users**: Banyak disposisi dibuat oleh satu user

### Sample Data

```sql
INSERT INTO disposisi (id, no_urut, tanggal_disposisi, tujuan_disposisi, isi_disposisi, status, surat_masuk_id, created_by_id) VALUES
('disp001', 1, '2025-12-01', 'Pimpinan DPRD', 'Harap ditindaklanjuti sesuai ketentuan yang berlaku', 'SELESAI', 'sm001', 'admin_id');
```

---

## 4. Table: surat_keluar

**Purpose**: Menyimpan data surat keluar yang diterbitkan oleh DPRD.

**Table Name**: `surat_keluar`  
**Primary Key**: `id`  
**Foreign Keys**: 2 (surat_masuk optional, users)  
**Indexes**: 6

### Struktur Kolom

| No | Column Name | Type | Length | Null | Default | PK | FK | UK | Description |
|----|-------------|------|--------|------|---------|----|----|----|-----------| 
| 1 | id | TEXT | 25 | NO | auto | ✅ | - | ✅ | CUID - Primary key |
| 2 | no_urut | INTEGER | - | NO | - | - | - | ✅ | Nomor urut surat (unique) |
| 3 | klas | VARCHAR | 100 | NO | - | - | - | - | Klasifikasi surat |
| 4 | pengolah | VARCHAR | 20 | NO | - | - | - | - | Pejabat pengolah surat |
| 5 | tanggal_surat | TIMESTAMP(3) | - | NO | - | - | - | - | Tanggal surat |
| 6 | perihal_surat | TEXT | 500 | NO | - | - | - | - | Perihal surat |
| 7 | kirim_kepada | VARCHAR | 200 | NO | - | - | - | - | Tujuan pengiriman |
| 8 | created_at | TIMESTAMP(3) | - | NO | now() | - | - | - | Waktu pembuatan |
| 9 | updated_at | TIMESTAMP(3) | - | NO | now() | - | - | - | Waktu update |
| 10 | surat_masuk_id | TEXT | 25 | YES | NULL | - | ✅ | - | FK ke surat_masuk.id (optional) |
| 11 | created_by_id | TEXT | 25 | NO | - | - | ✅ | - | FK ke users.id |

### Constraints

| Constraint Name | Type | Columns | Description |
|----------------|------|---------|-------------|
| surat_keluar_pkey | PRIMARY KEY | id | Primary key |
| surat_keluar_no_urut_unique | UNIQUE | no_urut | No urut unique |
| surat_keluar_no_urut_positive | CHECK | no_urut | no_urut > 0 |
| surat_keluar_pengolah_check | CHECK | pengolah | pengolah IN enum values |
| surat_keluar_surat_masuk_fk | FOREIGN KEY | surat_masuk_id | REFERENCES surat_masuk(id) ON DELETE SET NULL |
| surat_keluar_created_by_fk | FOREIGN KEY | created_by_id | REFERENCES users(id) ON DELETE RESTRICT |

### Indexes

| Index Name | Type | Columns | Description |
|-----------|------|---------|-------------|
| surat_keluar_id_key | UNIQUE | id | Primary key index |
| surat_keluar_no_urut_key | UNIQUE | no_urut | Quick lookup by no urut |
| surat_keluar_tanggal_surat_idx | INDEX (DESC) | tanggal_surat | Sort by date |
| surat_keluar_pengolah_idx | INDEX | pengolah | Filter by pengolah |
| surat_keluar_surat_masuk_id_idx | INDEX (filtered) | surat_masuk_id | Where surat_masuk_id IS NOT NULL |
| surat_keluar_created_by_id_idx | INDEX | created_by_id | FK join optimization |

### Business Rules

1. **Creation Methods**:
   - Manual: Admin buat langsung tanpa relasi surat masuk
   - From Surat Masuk: Buat via modal dari surat masuk (auto-populate noUrut)
2. **Pengolah Options** (Enum):
   - KETUA_DPRD: Ketua DPRD
   - WAKIL_KETUA_1: Wakil Ketua 1
   - WAKIL_KETUA_2: Wakil Ketua 2
   - WAKIL_KETUA_3: Wakil Ketua 3
   - SEKWAN: Sekretaris Dewan
3. **Optional Relation**: surat_masuk_id boleh NULL (untuk surat keluar manual)
4. **Icon Status**: UI menampilkan icon berbeda jika surat keluar terkait dengan surat masuk

### Relationships

- **N:1 dengan surat_masuk (optional)**: Banyak surat keluar bisa dari satu surat masuk
- **N:1 dengan users**: Banyak surat keluar dibuat oleh satu user

### Sample Data

```sql
INSERT INTO surat_keluar (id, no_urut, klas, pengolah, tanggal_surat, perihal_surat, kirim_kepada, surat_masuk_id, created_by_id) VALUES
('sk001', 1, 'Rahasia', 'KETUA_DPRD', '2025-12-01', 'Jawaban Undangan Rapat', 'Pemerintah Provinsi Kalsel', 'sm001', 'admin_id');
```

---

## 5. Table: surat_tamu

**Purpose**: Menyimpan data kunjungan tamu ke DPRD.

**Table Name**: `surat_tamu`  
**Primary Key**: `id`  
**Foreign Keys**: 1 (users)  
**Indexes**: 5

### Struktur Kolom

| No | Column Name | Type | Length | Null | Default | PK | FK | UK | Description |
|----|-------------|------|--------|------|---------|----|----|----|-----------| 
| 1 | id | TEXT | 25 | NO | auto | ✅ | - | ✅ | CUID - Primary key |
| 2 | no_urut | INTEGER | - | NO | - | - | - | ✅ | Nomor urut kunjungan (unique) |
| 3 | nama | VARCHAR | 200 | NO | - | - | - | - | Nama pengunjung |
| 4 | keperluan | TEXT | 500 | NO | - | - | - | - | Keperluan kunjungan |
| 5 | asal_surat | VARCHAR | 200 | NO | - | - | - | - | Asal instansi/organisasi |
| 6 | tujuan_surat | VARCHAR | 200 | NO | - | - | - | - | Tujuan kunjungan/department |
| 7 | nomor_telpon | VARCHAR | 20 | YES | NULL | - | - | - | Nomor telepon (optional) |
| 8 | tanggal | TIMESTAMP(3) | - | NO | - | - | - | - | Tanggal kunjungan |
| 9 | created_at | TIMESTAMP(3) | - | NO | now() | - | - | - | Waktu pencatatan |
| 10 | updated_at | TIMESTAMP(3) | - | NO | now() | - | - | - | Waktu update |
| 11 | created_by_id | TEXT | 25 | NO | - | - | ✅ | - | FK ke users.id |

### Constraints

| Constraint Name | Type | Columns | Description |
|----------------|------|---------|-------------|
| surat_tamu_pkey | PRIMARY KEY | id | Primary key |
| surat_tamu_no_urut_unique | UNIQUE | no_urut | No urut unique |
| surat_tamu_no_urut_positive | CHECK | no_urut | no_urut > 0 |
| surat_tamu_created_by_fk | FOREIGN KEY | created_by_id | REFERENCES users(id) ON DELETE RESTRICT |

### Indexes

| Index Name | Type | Columns | Description |
|-----------|------|---------|-------------|
| surat_tamu_id_key | UNIQUE | id | Primary key index |
| surat_tamu_no_urut_key | UNIQUE | no_urut | Quick lookup by no urut |
| surat_tamu_tanggal_idx | INDEX (DESC) | tanggal | Sort by visit date |
| surat_tamu_nama_idx | INDEX | nama | Search by visitor name |
| surat_tamu_created_by_id_idx | INDEX | created_by_id | FK join optimization |

### Business Rules

1. **Mandatory Fields**: nama, keperluan, asal_surat, tujuan_surat wajib diisi
2. **Optional Phone**: Nomor telepon tidak wajib
3. **Sequential NoUrut**: No urut harus sequential dan unique
4. **Default Date**: Tanggal default adalah hari ini saat pencatatan
5. **Separated Access**: Surat tamu punya route terpisah untuk tamu login

### Relationships

- **N:1 dengan users**: Banyak surat tamu dicatat oleh satu user

### Sample Data

```sql
INSERT INTO surat_tamu (id, no_urut, nama, keperluan, asal_surat, tujuan_surat, nomor_telpon, tanggal, created_by_id) VALUES
('st001', 1, 'John Doe', 'Konsultasi', 'PT ABC', 'Bagian Hukum', '08123456789', '2025-12-01', 'admin_id');
```

---

## 6. Table: audit_logs

**Purpose**: Menyimpan log aktivitas sistem untuk audit, security, dan compliance.

**Table Name**: `audit_logs`  
**Primary Key**: `id`  
**Foreign Keys**: None (intentional for historical data)  
**Indexes**: 6

### Struktur Kolom

| No | Column Name | Type | Length | Null | Default | PK | FK | UK | Description |
|----|-------------|------|--------|------|---------|----|----|----|-----------| 
| 1 | id | TEXT | 25 | NO | auto | ✅ | - | ✅ | CUID - Primary key |
| 2 | user_id | TEXT | 25 | YES | NULL | - | - | - | User ID (nullable untuk failed login) |
| 3 | action | VARCHAR | 50 | NO | - | - | - | - | Jenis aksi |
| 4 | entity | VARCHAR | 50 | YES | NULL | - | - | - | Nama entitas yang terpengaruh |
| 5 | entity_id | TEXT | 25 | YES | NULL | - | - | - | ID entitas yang terpengaruh |
| 6 | ip_address | VARCHAR | 45 | YES | NULL | - | - | - | IP address (IPv4/IPv6) |
| 7 | user_agent | TEXT | 500 | YES | NULL | - | - | - | Browser/device info |
| 8 | details | TEXT | 5000 | YES | NULL | - | - | - | Detail tambahan (JSON) |
| 9 | success | BOOLEAN | - | NO | true | - | - | - | Status keberhasilan |
| 10 | created_at | TIMESTAMP(3) | - | NO | now() | - | - | - | Timestamp event |

### Constraints

| Constraint Name | Type | Columns | Description |
|----------------|------|---------|-------------|
| audit_logs_pkey | PRIMARY KEY | id | Primary key |
| audit_logs_action_check | CHECK | action | action IN enum values |

### Indexes

| Index Name | Type | Columns | Description |
|-----------|------|---------|-------------|
| audit_logs_id_key | UNIQUE | id | Primary key index |
| audit_logs_user_id_idx | INDEX | user_id | Filter by user |
| audit_logs_action_idx | INDEX | action | Filter by action type |
| audit_logs_created_at_idx | INDEX (DESC) | created_at | Sort by time (most recent first) |
| audit_logs_entity_idx | INDEX | entity | Filter by entity type |
| audit_logs_composite_idx | COMPOSITE | user_id, action, created_at | Optimized multi-filter queries |

### Business Rules

1. **Action Types** (Enum):
   - LOGIN: User berhasil login
   - LOGOUT: User logout
   - FAILED_LOGIN: Percobaan login gagal
   - CREATE: Buat data baru
   - UPDATE: Update data existing
   - DELETE: Hapus data
   - EXPORT: Export data ke file
2. **Nullable User**: user_id NULL untuk failed login (user belum teridentifikasi)
3. **No Foreign Key**: Tidak ada FK ke users agar log tetap ada meski user dihapus
4. **Retention**: Keep logs for 7 years (compliance requirement)
5. **Auto Logging**: Semua aktivitas penting otomatis di-log via application layer
6. **IP Tracking**: Support IPv4 (max 15 chars) dan IPv6 (max 45 chars)

### Logged Events

| Event Category | Actions | Example Details |
|---------------|---------|-----------------|
| Authentication | LOGIN, LOGOUT, FAILED_LOGIN | { email, ip_address, user_agent } |
| User Management | CREATE, UPDATE, DELETE | { entity: "User", entityId, changes } |
| Surat Masuk | CREATE, UPDATE, DELETE | { entity: "SuratMasuk", noUrut, changes } |
| Surat Keluar | CREATE, UPDATE, DELETE | { entity: "SuratKeluar", noUrut, changes } |
| Disposisi | CREATE, UPDATE, DELETE, EXPORT | { entity: "Disposisi", noUrut, changes } |
| Surat Tamu | CREATE, UPDATE, DELETE | { entity: "SuratTamu", nama, changes } |

### Relationships

- **None**: Intentionally no foreign key to preserve historical data

### Sample Data

```sql
INSERT INTO audit_logs (id, user_id, action, entity, entity_id, ip_address, user_agent, success) VALUES
('log001', 'admin_id', 'LOGIN', NULL, NULL, '192.168.1.1', 'Mozilla/5.0...', true),
('log002', NULL, 'FAILED_LOGIN', NULL, NULL, '192.168.1.100', 'Mozilla/5.0...', false),
('log003', 'admin_id', 'CREATE', 'SuratMasuk', 'sm001', '192.168.1.1', 'Mozilla/5.0...', true);
```

---

## Relationship Summary

### Entity Relationship Diagram (Text)

```
users (1) ───< (N) surat_masuk (1) ───< (N) disposisi
  │                    │
  │                    └───< (N) surat_keluar
  │
  ├───< (N) surat_keluar
  │
  ├───< (N) disposisi
  │
  └───< (N) surat_tamu

audit_logs (no FK, standalone for history)
```

### Relationship Matrix

| Parent Table | Child Table | Type | Cardinality | Delete Rule | Update Rule | Business Rule |
|--------------|-------------|------|-------------|-------------|-------------|---------------|
| users | surat_masuk | 1:N | Mandatory | RESTRICT | CASCADE | User creates surat masuk |
| users | surat_keluar | 1:N | Mandatory | RESTRICT | CASCADE | User creates surat keluar |
| users | disposisi | 1:N | Mandatory | RESTRICT | CASCADE | User creates disposisi |
| users | surat_tamu | 1:N | Mandatory | RESTRICT | CASCADE | User records surat tamu |
| surat_masuk | disposisi | 1:N | Mandatory | CASCADE | CASCADE | Surat masuk has disposisi |
| surat_masuk | surat_keluar | 1:N | Optional | SET NULL | CASCADE | Surat masuk may generate surat keluar |

**Delete Rules Explanation**:
- **RESTRICT**: Tidak bisa hapus parent jika ada child (data integrity)
- **CASCADE**: Hapus parent akan otomatis hapus child (tightly coupled data)
- **SET NULL**: Hapus parent akan set FK child jadi NULL (loosely coupled data)

---

## Data Dictionary

### Common Field Patterns

| Field Pattern | Type | Description | Example Tables |
|--------------|------|-------------|----------------|
| id | TEXT (CUID) | Primary key - unique identifier | All tables |
| no_urut | INTEGER | Sequential number - business key | surat_masuk, disposisi, surat_keluar, surat_tamu |
| created_at | TIMESTAMP(3) | Record creation timestamp | All tables except audit_logs |
| updated_at | TIMESTAMP(3) | Last update timestamp | All tables except audit_logs |
| created_by_id | TEXT (FK) | User who created the record | surat_masuk, disposisi, surat_keluar, surat_tamu |

### Enum Definitions

#### Role
```
ADMIN  - Full access to all features
MEMBER - Read-only access
```

#### StatusDisposisi
```
SELESAI - Disposition completed (default and only current value)
```
*Future: PENDING, PROSES, BATAL*

#### PengolahSurat
```
KETUA_DPRD     - Ketua DPRD
WAKIL_KETUA_1  - Wakil Ketua 1
WAKIL_KETUA_2  - Wakil Ketua 2
WAKIL_KETUA_3  - Wakil Ketua 3
SEKWAN         - Sekretaris Dewan
```

### Data Validation Rules

| Field Type | Validation | Example |
|-----------|------------|---------|
| Email | Format email valid | user@domain.com |
| Password | Min 8 char, complexity | P@ssw0rd123 |
| Integer | Positive number | no_urut > 0 |
| Date | Valid date, logical | tanggal_surat <= tanggal_diteruskan |
| Text | Max length | perihal <= 500 chars |
| Enum | In allowed values | role IN ('ADMIN', 'MEMBER') |

---

## Database Statistics

| Metric | Value | Notes |
|--------|-------|-------|
| Total Tables | 6 | 5 transaction + 1 audit |
| Total Columns | 61 | Across all tables |
| Total Indexes | 35 | Including unique & composite |
| Total Constraints | 23 | PK, FK, UK, CHECK |
| Estimated Size (1 year) | ~30 MB | With moderate usage |
| Estimated Rows (1 year) | ~66,000 | Across all tables |

---

**Dibuat pada**: 1 Desember 2025  
**Versi**: 1.0  
**Sistem**: Arsip DPRD Provinsi Kalimantan Selatan  
**Database**: PostgreSQL 14.x via Neon Serverless
