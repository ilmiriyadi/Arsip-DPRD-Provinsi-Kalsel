# LDM (Logical Data Model) - Sistem Manajemen Arsip DPRD Kalimantan Selatan

## 📊 Logical Data Model

Logical Data Model (LDM) menggambarkan struktur data dengan detail atribut, tipe data, constraint, primary key, dan foreign key namun masih independent dari DBMS spesifik.

---

## 🗂️ Entity Specifications

### 1. USER

**Table Name**: `users`

| Attribute Name | Data Type | Length | Nullable | Unique | Default | Description |
|---------------|-----------|--------|----------|--------|---------|-------------|
| **id** 🔑 | String (CUID) | 25 | No | Yes | auto | Primary Key - Unique identifier |
| email | String | 255 | No | Yes | - | Email address (unique) |
| name | String | 100 | Yes | No | null | Full name of user |
| password | String (Hash) | 60 | No | No | - | Bcrypt hashed password |
| role | Enum | - | No | No | MEMBER | User role (ADMIN/MEMBER) |
| createdAt | DateTime | - | No | No | now() | Record creation timestamp |
| updatedAt | DateTime | - | No | No | now() | Last update timestamp |

**Primary Key**: `id`

**Unique Constraints**:
- UK_users_email: `email`

**Indexes**:
- PK_users: `id` (clustered)
- UK_users_email: `email` (unique)
- IX_users_role: `role` (non-clustered)

**Check Constraints**:
- CK_users_email_format: email LIKE '%@%'
- CK_users_role: role IN ('ADMIN', 'MEMBER')

**Business Rules**:
- Email must be valid format
- Password must be bcrypt hash (60 chars)
- Role default is MEMBER
- First user to register becomes ADMIN

---

### 2. SURAT_MASUK

**Table Name**: `surat_masuk`

| Attribute Name | Data Type | Length | Nullable | Unique | Default | Description |
|---------------|-----------|--------|----------|--------|---------|-------------|
| **id** 🔑 | String (CUID) | 25 | No | Yes | auto | Primary Key |
| noUrut | Integer | - | No | Yes | - | Sequential number (unique) |
| nomorSurat | String | 50 | Yes | Yes | null | Official letter number (optional, unique) |
| tanggalSurat | Date | - | No | No | - | Letter date |
| tanggalDiteruskan | Date | - | No | No | - | Forward date |
| asalSurat | String | 200 | No | No | - | Letter origin/sender |
| perihal | Text | 500 | No | No | - | Letter subject |
| keterangan | Text | 1000 | Yes | No | null | Additional notes |
| filePath | String | 500 | Yes | No | null | Document file path |
| createdAt | DateTime | - | No | No | now() | Record creation timestamp |
| updatedAt | DateTime | - | No | No | now() | Last update timestamp |
| **createdById** 🔗 | String (CUID) | 25 | No | No | - | Foreign Key to users.id |

**Primary Key**: `id`

**Foreign Keys**:
- FK_surat_masuk_user: `createdById` REFERENCES `users(id)` ON DELETE RESTRICT ON UPDATE CASCADE

**Unique Constraints**:
- UK_surat_masuk_noUrut: `noUrut`
- UK_surat_masuk_nomorSurat: `nomorSurat` (where nomorSurat IS NOT NULL)

**Indexes**:
- PK_surat_masuk: `id` (clustered)
- UK_surat_masuk_noUrut: `noUrut` (unique)
- UK_surat_masuk_nomorSurat: `nomorSurat` (unique, filtered)
- IX_surat_masuk_tanggalSurat: `tanggalSurat` (non-clustered)
- IX_surat_masuk_asalSurat: `asalSurat` (non-clustered)
- IX_surat_masuk_createdById: `createdById` (non-clustered)

**Check Constraints**:
- CK_surat_masuk_noUrut: noUrut > 0
- CK_surat_masuk_dates: tanggalSurat <= tanggalDiteruskan

---

### 3. DISPOSISI

**Table Name**: `disposisi`

| Attribute Name | Data Type | Length | Nullable | Unique | Default | Description |
|---------------|-----------|--------|----------|--------|---------|-------------|
| **id** 🔑 | String (CUID) | 25 | No | Yes | auto | Primary Key |
| nomorDisposisi | String | 50 | Yes | Yes | null | Official disposition number (optional, unique) |
| noUrut | Integer | - | No | No | - | Sequential number (from surat masuk) |
| tanggalDisposisi | Date | - | No | No | - | Disposition date |
| tujuanDisposisi | String | 200 | No | No | - | Disposition target/destination |
| isiDisposisi | Text | 2000 | No | No | - | Disposition content/instruction |
| keterangan | Text | 1000 | Yes | No | null | Additional notes |
| status | Enum | - | No | No | SELESAI | Disposition status |
| createdAt | DateTime | - | No | No | now() | Record creation timestamp |
| updatedAt | DateTime | - | No | No | now() | Last update timestamp |
| **suratMasukId** 🔗 | String (CUID) | 25 | No | No | - | Foreign Key to surat_masuk.id |
| **createdById** 🔗 | String (CUID) | 25 | No | No | - | Foreign Key to users.id |

**Primary Key**: `id`

**Foreign Keys**:
- FK_disposisi_surat_masuk: `suratMasukId` REFERENCES `surat_masuk(id)` ON DELETE CASCADE ON UPDATE CASCADE
- FK_disposisi_user: `createdById` REFERENCES `users(id)` ON DELETE RESTRICT ON UPDATE CASCADE

**Unique Constraints**:
- UK_disposisi_nomorDisposisi: `nomorDisposisi` (where nomorDisposisi IS NOT NULL)

**Indexes**:
- PK_disposisi: `id` (clustered)
- UK_disposisi_nomorDisposisi: `nomorDisposisi` (unique, filtered)
- IX_disposisi_noUrut: `noUrut` (non-clustered)
- IX_disposisi_tanggalDisposisi: `tanggalDisposisi` (non-clustered)
- IX_disposisi_status: `status` (non-clustered)
- IX_disposisi_suratMasukId: `suratMasukId` (non-clustered)
- IX_disposisi_createdById: `createdById` (non-clustered)

**Check Constraints**:
- CK_disposisi_noUrut: noUrut > 0
- CK_disposisi_status: status IN ('SELESAI')

---

### 4. SURAT_KELUAR

**Table Name**: `surat_keluar`

| Attribute Name | Data Type | Length | Nullable | Unique | Default | Description |
|---------------|-----------|--------|----------|--------|---------|-------------|
| **id** 🔑 | String (CUID) | 25 | No | Yes | auto | Primary Key |
| noUrut | Integer | - | No | Yes | - | Sequential number (unique) |
| klas | String | 100 | No | No | - | Letter classification |
| pengolah | Enum | - | No | No | - | Letter processor/official |
| tanggalSurat | Date | - | No | No | - | Letter date |
| perihalSurat | Text | 500 | No | No | - | Letter subject |
| kirimKepada | String | 200 | No | No | - | Send to/recipient |
| createdAt | DateTime | - | No | No | now() | Record creation timestamp |
| updatedAt | DateTime | - | No | No | now() | Last update timestamp |
| **suratMasukId** 🔗 | String (CUID) | 25 | Yes | No | null | Foreign Key to surat_masuk.id (optional) |
| **createdById** 🔗 | String (CUID) | 25 | No | No | - | Foreign Key to users.id |

**Primary Key**: `id`

**Foreign Keys**:
- FK_surat_keluar_surat_masuk: `suratMasukId` REFERENCES `surat_masuk(id)` ON DELETE SET NULL ON UPDATE CASCADE
- FK_surat_keluar_user: `createdById` REFERENCES `users(id)` ON DELETE RESTRICT ON UPDATE CASCADE

**Unique Constraints**:
- UK_surat_keluar_noUrut: `noUrut`

**Indexes**:
- PK_surat_keluar: `id` (clustered)
- UK_surat_keluar_noUrut: `noUrut` (unique)
- IX_surat_keluar_tanggalSurat: `tanggalSurat` (non-clustered)
- IX_surat_keluar_pengolah: `pengolah` (non-clustered)
- IX_surat_keluar_suratMasukId: `suratMasukId` (non-clustered)
- IX_surat_keluar_createdById: `createdById` (non-clustered)

**Check Constraints**:
- CK_surat_keluar_noUrut: noUrut > 0
- CK_surat_keluar_pengolah: pengolah IN ('KETUA_DPRD', 'WAKIL_KETUA_1', 'WAKIL_KETUA_2', 'WAKIL_KETUA_3', 'SEKWAN')

---

### 5. SURAT_TAMU

**Table Name**: `surat_tamu`

| Attribute Name | Data Type | Length | Nullable | Unique | Default | Description |
|---------------|-----------|--------|----------|--------|---------|-------------|
| **id** 🔑 | String (CUID) | 25 | No | Yes | auto | Primary Key |
| noUrut | Integer | - | No | Yes | - | Sequential number (unique) |
| nama | String | 200 | No | No | - | Visitor name |
| keperluan | Text | 500 | No | No | - | Visit purpose |
| asalSurat | String | 200 | No | No | - | Origin institution/organization |
| tujuanSurat | String | 200 | No | No | - | Visit destination/department |
| nomorTelpon | String | 20 | Yes | No | null | Phone number |
| tanggal | Date | - | No | No | - | Visit date |
| createdAt | DateTime | - | No | No | now() | Record creation timestamp |
| updatedAt | DateTime | - | No | No | now() | Last update timestamp |
| **createdById** 🔗 | String (CUID) | 25 | No | No | - | Foreign Key to users.id |

**Primary Key**: `id`

**Foreign Keys**:
- FK_surat_tamu_user: `createdById` REFERENCES `users(id)` ON DELETE RESTRICT ON UPDATE CASCADE

**Unique Constraints**:
- UK_surat_tamu_noUrut: `noUrut`

**Indexes**:
- PK_surat_tamu: `id` (clustered)
- UK_surat_tamu_noUrut: `noUrut` (unique)
- IX_surat_tamu_tanggal: `tanggal` (non-clustered)
- IX_surat_tamu_nama: `nama` (non-clustered)
- IX_surat_tamu_createdById: `createdById` (non-clustered)

**Check Constraints**:
- CK_surat_tamu_noUrut: noUrut > 0

---

### 6. AUDIT_LOG

**Table Name**: `audit_logs`

| Attribute Name | Data Type | Length | Nullable | Unique | Default | Description |
|---------------|-----------|--------|----------|--------|---------|-------------|
| **id** 🔑 | String (CUID) | 25 | No | Yes | auto | Primary Key |
| userId | String (CUID) | 25 | Yes | No | null | User ID (nullable for failed login) |
| action | String | 50 | No | No | - | Action type (LOGIN, LOGOUT, etc) |
| entity | String | 50 | Yes | No | null | Entity name affected |
| entityId | String (CUID) | 25 | Yes | No | null | Entity ID affected |
| ipAddress | String | 45 | Yes | No | null | IP address (supports IPv6) |
| userAgent | Text | 500 | Yes | No | null | Browser/device information |
| details | Text (JSON) | 5000 | Yes | No | null | Additional details in JSON format |
| success | Boolean | - | No | No | true | Success status of action |
| createdAt | DateTime | - | No | No | now() | Event timestamp |

**Primary Key**: `id`

**Foreign Keys**:
- None (userId is not FK to allow logging of deleted users)

**Indexes**:
- PK_audit_logs: `id` (clustered)
- IX_audit_logs_userId: `userId` (non-clustered)
- IX_audit_logs_action: `action` (non-clustered)
- IX_audit_logs_createdAt: `createdAt` (non-clustered, descending)
- IX_audit_logs_entity: `entity` (non-clustered)

**Check Constraints**:
- CK_audit_logs_action: action IN ('LOGIN', 'LOGOUT', 'FAILED_LOGIN', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT')

---

## 🔗 Relationship Matrix

| Parent Table | Child Table | Relationship | Cardinality | Delete Rule | Update Rule | FK Column |
|--------------|-------------|--------------|-------------|-------------|-------------|-----------|
| users | surat_masuk | creates | 1:N | RESTRICT | CASCADE | createdById |
| users | surat_keluar | creates | 1:N | RESTRICT | CASCADE | createdById |
| users | disposisi | creates | 1:N | RESTRICT | CASCADE | createdById |
| users | surat_tamu | creates | 1:N | RESTRICT | CASCADE | createdById |
| surat_masuk | disposisi | has | 1:N | CASCADE | CASCADE | suratMasukId |
| surat_masuk | surat_keluar | generates | 1:N (optional) | SET NULL | CASCADE | suratMasukId |

**Legend**:
- **RESTRICT**: Prevent delete if child records exist
- **CASCADE**: Delete/update child records automatically
- **SET NULL**: Set FK to null when parent deleted

---

## 📐 Normalization Analysis

### First Normal Form (1NF) ✅
- All tables have primary keys
- All attributes contain atomic values
- No repeating groups
- Each column contains values of a single type

### Second Normal Form (2NF) ✅
- Meets 1NF requirements
- All non-key attributes are fully dependent on primary key
- No partial dependencies (all PKs are single column)

### Third Normal Form (3NF) ✅
- Meets 2NF requirements
- No transitive dependencies
- All non-key attributes depend only on primary key

### Boyce-Codd Normal Form (BCNF) ✅
- Meets 3NF requirements
- Every determinant is a candidate key
- No anomalies in current design

**Denormalization Considerations**:
- None required at this time
- Read performance is good with proper indexes
- Write performance is acceptable for transaction volume

---

## 🎯 Domain Definitions

### Enumeration: Role
```
DOMAIN Role AS ENUM {
  'ADMIN',
  'MEMBER'
}
```

**Description**: User roles in the system
**Default**: MEMBER
**Usage**: users.role

---

### Enumeration: StatusDisposisi
```
DOMAIN StatusDisposisi AS ENUM {
  'SELESAI'
}
```

**Description**: Disposition completion status
**Default**: SELESAI
**Usage**: disposisi.status

**Note**: Currently single value, designed for future expansion (PENDING, PROSES, BATAL)

---

### Enumeration: PengolahSurat
```
DOMAIN PengolahSurat AS ENUM {
  'KETUA_DPRD',
  'WAKIL_KETUA_1',
  'WAKIL_KETUA_2',
  'WAKIL_KETUA_3',
  'SEKWAN'
}
```

**Description**: Letter processor/official
**Usage**: surat_keluar.pengolah

---

## 🔐 Security & Integrity Constraints

### Data Integrity Rules

1. **Entity Integrity**
   - Every table must have a primary key
   - Primary key values must be unique and not null
   - Using CUID for distributed-safe unique identifiers

2. **Referential Integrity**
   - All foreign keys must reference existing primary keys
   - Delete and update rules must be enforced
   - Orphaned records not allowed (except for audit logs)

3. **Domain Integrity**
   - All columns must have defined data types
   - Null/Not null constraints enforced
   - Check constraints validate data ranges
   - Unique constraints prevent duplicates

4. **User-Defined Integrity**
   - Email format validation
   - Date logical validation (tanggalSurat <= tanggalDiteruskan)
   - Positive integer validation for noUrut
   - Enum value validation

### Security Constraints

1. **Password Security**
   - Must be bcrypt hashed
   - Minimum 8 characters (enforced at application layer)
   - Complexity requirements (enforced at application layer)

2. **Audit Trail**
   - All CUD operations logged
   - Authentication events logged
   - IP address and user agent captured

3. **Access Control**
   - Role-based access enforced at application layer
   - Session management with secure cookies
   - CSRF protection for all mutations

---

## 📊 Data Volume Estimates

| Table | Estimated Rows/Year | Growth Rate | Storage Estimate |
|-------|---------------------|-------------|------------------|
| users | 50 | Low | 10 KB |
| surat_masuk | 5,000 | Medium | 500 KB |
| surat_keluar | 3,000 | Medium | 300 KB |
| disposisi | 7,000 | Medium | 700 KB |
| surat_tamu | 1,000 | Low | 100 KB |
| audit_logs | 50,000 | High | 5 MB |
| **Total** | **66,050** | - | **~6.6 MB/year** |

**Assumptions**:
- Average 20 working days/month
- Average 250 surat masuk/month
- Average 150 surat keluar/month
- Average 300 disposisi/month
- Average 40 surat tamu/month

**Retention Policy**:
- Transaction data: Keep indefinitely
- Audit logs: Keep for 7 years (compliance)
- Soft delete for critical data

---

## 🔍 Query Optimization Considerations

### Critical Queries

1. **Dashboard Statistics**
   ```sql
   SELECT COUNT(*) FROM surat_masuk
   SELECT COUNT(*) FROM surat_keluar
   SELECT COUNT(*) FROM disposisi
   ```
   **Optimization**: Use COUNT(*) cache or materialized view

2. **Search Surat Masuk**
   ```sql
   WHERE nomorSurat ILIKE '%term%'
   OR asalSurat ILIKE '%term%'
   OR perihal ILIKE '%term%'
   ```
   **Optimization**: Indexes on search fields, consider full-text search

3. **Filter by Date Range**
   ```sql
   WHERE tanggalSurat BETWEEN date1 AND date2
   ```
   **Optimization**: Index on tanggalSurat

4. **User Activity Log**
   ```sql
   WHERE userId = ? ORDER BY createdAt DESC
   ```
   **Optimization**: Composite index (userId, createdAt)

---

## 📈 Scalability Considerations

### Horizontal Scaling
- Use CUID instead of auto-increment for distributed systems
- Stateless application design
- Database connection pooling

### Vertical Scaling
- Proper indexing strategy
- Query optimization
- Caching layer (Redis) for frequently accessed data

### Future Enhancements
- Partitioning audit_logs by date (yearly partitions)
- Read replicas for reporting
- Archive old data to separate database
- Implement full-text search (PostgreSQL FTS or Elasticsearch)

---

**Dibuat pada**: 1 Desember 2025  
**Versi**: 1.0  
**Sistem**: Arsip DPRD Provinsi Kalimantan Selatan  
**Notasi**: Logical Data Model (LDM) - Database Independent Design
