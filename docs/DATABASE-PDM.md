# PDM (Physical Data Model) - Sistem Manajemen Arsip DPRD Kalimantan Selatan

## 📊 Physical Data Model

Physical Data Model (PDM) adalah implementasi spesifik database menggunakan **PostgreSQL 14+** dengan detail lengkap tipe data, constraint, index, dan optimization.

---

## 🗄️ Database Information

**DBMS**: PostgreSQL 14.x (Neon Serverless PostgreSQL)  
**Character Set**: UTF-8  
**Collation**: en_US.UTF-8  
**Region**: Asia Pacific (Singapore) - ap-southeast-1  
**Connection**: Pooled connection via Neon  
**ORM**: Prisma 6.17.0

---

## 📋 Table Definitions (DDL)

### 1. Table: users

```sql
CREATE TABLE users (
    id                  TEXT PRIMARY KEY,
    email               VARCHAR(255) NOT NULL,
    name                VARCHAR(100),
    password            VARCHAR(60) NOT NULL,
    role                VARCHAR(10) NOT NULL DEFAULT 'MEMBER',
    created_at          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT users_email_unique UNIQUE (email),
    CONSTRAINT users_role_check CHECK (role IN ('ADMIN', 'MEMBER'))
);

-- Indexes
CREATE UNIQUE INDEX users_id_key ON users(id);
CREATE UNIQUE INDEX users_email_key ON users(email);
CREATE INDEX users_role_idx ON users(role);

-- Comments
COMMENT ON TABLE users IS 'User accounts with role-based access';
COMMENT ON COLUMN users.id IS 'CUID - Unique identifier';
COMMENT ON COLUMN users.email IS 'Email address - used for login';
COMMENT ON COLUMN users.password IS 'Bcrypt hashed password (60 chars)';
COMMENT ON COLUMN users.role IS 'User role: ADMIN or MEMBER';
```

**Storage Estimate**: ~200 bytes per row  
**Expected Rows**: 50-100  
**Total Size**: ~10-20 KB

---

### 2. Table: surat_masuk

```sql
CREATE TABLE surat_masuk (
    id                      TEXT PRIMARY KEY,
    no_urut                 INTEGER NOT NULL,
    nomor_surat             VARCHAR(50),
    tanggal_surat           TIMESTAMP(3) NOT NULL,
    tanggal_diteruskan      TIMESTAMP(3) NOT NULL,
    asal_surat              VARCHAR(200) NOT NULL,
    perihal                 TEXT NOT NULL,
    keterangan              TEXT,
    file_path               VARCHAR(500),
    created_at              TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_id           TEXT NOT NULL,
    
    CONSTRAINT surat_masuk_no_urut_unique UNIQUE (no_urut),
    CONSTRAINT surat_masuk_nomor_surat_unique UNIQUE (nomor_surat),
    CONSTRAINT surat_masuk_no_urut_positive CHECK (no_urut > 0),
    CONSTRAINT surat_masuk_dates_logical CHECK (tanggal_surat <= tanggal_diteruskan),
    CONSTRAINT surat_masuk_created_by_fk FOREIGN KEY (created_by_id) 
        REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Indexes
CREATE UNIQUE INDEX surat_masuk_id_key ON surat_masuk(id);
CREATE UNIQUE INDEX surat_masuk_no_urut_key ON surat_masuk(no_urut);
CREATE UNIQUE INDEX surat_masuk_nomor_surat_key ON surat_masuk(nomor_surat) 
    WHERE nomor_surat IS NOT NULL;
CREATE INDEX surat_masuk_tanggal_surat_idx ON surat_masuk(tanggal_surat DESC);
CREATE INDEX surat_masuk_asal_surat_idx ON surat_masuk(asal_surat);
CREATE INDEX surat_masuk_perihal_idx ON surat_masuk USING gin(to_tsvector('indonesian', perihal));
CREATE INDEX surat_masuk_created_by_id_idx ON surat_masuk(created_by_id);

-- Comments
COMMENT ON TABLE surat_masuk IS 'Incoming letters received by DPRD';
COMMENT ON COLUMN surat_masuk.no_urut IS 'Sequential number - unique identifier';
COMMENT ON COLUMN surat_masuk.nomor_surat IS 'Official letter number - optional but unique';
COMMENT ON COLUMN surat_masuk.perihal IS 'Letter subject/purpose';
```

**Storage Estimate**: ~500 bytes per row  
**Expected Rows**: ~5,000/year  
**Total Size**: ~2.5 MB/year

---

### 3. Table: disposisi

```sql
CREATE TABLE disposisi (
    id                      TEXT PRIMARY KEY,
    nomor_disposisi         VARCHAR(50),
    no_urut                 INTEGER NOT NULL,
    tanggal_disposisi       TIMESTAMP(3) NOT NULL,
    tujuan_disposisi        VARCHAR(200) NOT NULL,
    isi_disposisi           TEXT NOT NULL,
    keterangan              TEXT,
    status                  VARCHAR(10) NOT NULL DEFAULT 'SELESAI',
    created_at              TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    surat_masuk_id          TEXT NOT NULL,
    created_by_id           TEXT NOT NULL,
    
    CONSTRAINT disposisi_nomor_disposisi_unique UNIQUE (nomor_disposisi),
    CONSTRAINT disposisi_no_urut_positive CHECK (no_urut > 0),
    CONSTRAINT disposisi_status_check CHECK (status IN ('SELESAI')),
    CONSTRAINT disposisi_surat_masuk_fk FOREIGN KEY (surat_masuk_id) 
        REFERENCES surat_masuk(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT disposisi_created_by_fk FOREIGN KEY (created_by_id) 
        REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Indexes
CREATE UNIQUE INDEX disposisi_id_key ON disposisi(id);
CREATE UNIQUE INDEX disposisi_nomor_disposisi_key ON disposisi(nomor_disposisi) 
    WHERE nomor_disposisi IS NOT NULL;
CREATE INDEX disposisi_no_urut_idx ON disposisi(no_urut);
CREATE INDEX disposisi_tanggal_disposisi_idx ON disposisi(tanggal_disposisi DESC);
CREATE INDEX disposisi_status_idx ON disposisi(status);
CREATE INDEX disposisi_tujuan_disposisi_idx ON disposisi(tujuan_disposisi);
CREATE INDEX disposisi_surat_masuk_id_idx ON disposisi(surat_masuk_id);
CREATE INDEX disposisi_created_by_id_idx ON disposisi(created_by_id);

-- Comments
COMMENT ON TABLE disposisi IS 'Disposition/instruction for incoming letters';
COMMENT ON COLUMN disposisi.no_urut IS 'Sequential number from related surat_masuk';
COMMENT ON COLUMN disposisi.status IS 'Current status - default SELESAI (completed)';
```

**Storage Estimate**: ~700 bytes per row  
**Expected Rows**: ~7,000/year  
**Total Size**: ~4.9 MB/year

---

### 4. Table: surat_keluar

```sql
CREATE TABLE surat_keluar (
    id                      TEXT PRIMARY KEY,
    no_urut                 INTEGER NOT NULL,
    klas                    VARCHAR(100) NOT NULL,
    pengolah                VARCHAR(20) NOT NULL,
    tanggal_surat           TIMESTAMP(3) NOT NULL,
    perihal_surat           TEXT NOT NULL,
    kirim_kepada            VARCHAR(200) NOT NULL,
    created_at              TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    surat_masuk_id          TEXT,
    created_by_id           TEXT NOT NULL,
    
    CONSTRAINT surat_keluar_no_urut_unique UNIQUE (no_urut),
    CONSTRAINT surat_keluar_no_urut_positive CHECK (no_urut > 0),
    CONSTRAINT surat_keluar_pengolah_check CHECK (pengolah IN (
        'KETUA_DPRD', 'WAKIL_KETUA_1', 'WAKIL_KETUA_2', 'WAKIL_KETUA_3', 'SEKWAN'
    )),
    CONSTRAINT surat_keluar_surat_masuk_fk FOREIGN KEY (surat_masuk_id) 
        REFERENCES surat_masuk(id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT surat_keluar_created_by_fk FOREIGN KEY (created_by_id) 
        REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Indexes
CREATE UNIQUE INDEX surat_keluar_id_key ON surat_keluar(id);
CREATE UNIQUE INDEX surat_keluar_no_urut_key ON surat_keluar(no_urut);
CREATE INDEX surat_keluar_tanggal_surat_idx ON surat_keluar(tanggal_surat DESC);
CREATE INDEX surat_keluar_pengolah_idx ON surat_keluar(pengolah);
CREATE INDEX surat_keluar_surat_masuk_id_idx ON surat_keluar(surat_masuk_id) 
    WHERE surat_masuk_id IS NOT NULL;
CREATE INDEX surat_keluar_created_by_id_idx ON surat_keluar(created_by_id);

-- Comments
COMMENT ON TABLE surat_keluar IS 'Outgoing letters issued by DPRD';
COMMENT ON COLUMN surat_keluar.pengolah IS 'Official who processes the letter';
COMMENT ON COLUMN surat_keluar.surat_masuk_id IS 'Related incoming letter (optional)';
```

**Storage Estimate**: ~400 bytes per row  
**Expected Rows**: ~3,000/year  
**Total Size**: ~1.2 MB/year

---

### 5. Table: surat_tamu

```sql
CREATE TABLE surat_tamu (
    id                      TEXT PRIMARY KEY,
    no_urut                 INTEGER NOT NULL,
    nama                    VARCHAR(200) NOT NULL,
    keperluan               TEXT NOT NULL,
    asal_surat              VARCHAR(200) NOT NULL,
    tujuan_surat            VARCHAR(200) NOT NULL,
    nomor_telpon            VARCHAR(20),
    tanggal                 TIMESTAMP(3) NOT NULL,
    created_at              TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_id           TEXT NOT NULL,
    
    CONSTRAINT surat_tamu_no_urut_unique UNIQUE (no_urut),
    CONSTRAINT surat_tamu_no_urut_positive CHECK (no_urut > 0),
    CONSTRAINT surat_tamu_created_by_fk FOREIGN KEY (created_by_id) 
        REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Indexes
CREATE UNIQUE INDEX surat_tamu_id_key ON surat_tamu(id);
CREATE UNIQUE INDEX surat_tamu_no_urut_key ON surat_tamu(no_urut);
CREATE INDEX surat_tamu_tanggal_idx ON surat_tamu(tanggal DESC);
CREATE INDEX surat_tamu_nama_idx ON surat_tamu(nama);
CREATE INDEX surat_tamu_created_by_id_idx ON surat_tamu(created_by_id);

-- Comments
COMMENT ON TABLE surat_tamu IS 'Guest visit records';
COMMENT ON COLUMN surat_tamu.nama IS 'Visitor full name';
COMMENT ON COLUMN surat_tamu.keperluan IS 'Purpose of visit';
```

**Storage Estimate**: ~300 bytes per row  
**Expected Rows**: ~1,000/year  
**Total Size**: ~300 KB/year

---

### 6. Table: audit_logs

```sql
CREATE TABLE audit_logs (
    id                      TEXT PRIMARY KEY,
    user_id                 TEXT,
    action                  VARCHAR(50) NOT NULL,
    entity                  VARCHAR(50),
    entity_id               TEXT,
    ip_address              VARCHAR(45),
    user_agent              TEXT,
    details                 TEXT,
    success                 BOOLEAN NOT NULL DEFAULT true,
    created_at              TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT audit_logs_action_check CHECK (action IN (
        'LOGIN', 'LOGOUT', 'FAILED_LOGIN', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT'
    ))
);

-- Indexes
CREATE UNIQUE INDEX audit_logs_id_key ON audit_logs(id);
CREATE INDEX audit_logs_user_id_idx ON audit_logs(user_id);
CREATE INDEX audit_logs_action_idx ON audit_logs(action);
CREATE INDEX audit_logs_created_at_idx ON audit_logs(created_at DESC);
CREATE INDEX audit_logs_entity_idx ON audit_logs(entity);
CREATE INDEX audit_logs_composite_idx ON audit_logs(user_id, action, created_at DESC);

-- Partitioning (for future scalability)
-- CREATE TABLE audit_logs_2025 PARTITION OF audit_logs 
--     FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');

-- Comments
COMMENT ON TABLE audit_logs IS 'Comprehensive audit log for security and compliance';
COMMENT ON COLUMN audit_logs.user_id IS 'User ID - nullable for failed login attempts';
COMMENT ON COLUMN audit_logs.details IS 'Additional details in JSON format';
COMMENT ON COLUMN audit_logs.ip_address IS 'IPv4 or IPv6 address';
```

**Storage Estimate**: ~500 bytes per row  
**Expected Rows**: ~50,000/year  
**Total Size**: ~25 MB/year

---

## 🔐 Security & Performance Features

### 1. Row Level Security (Future Enhancement)

```sql
-- Enable RLS on sensitive tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE surat_masuk ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own data (for MEMBER role)
CREATE POLICY member_view_own_data ON surat_masuk
    FOR SELECT
    USING (
        current_setting('app.current_user_role') = 'ADMIN'
        OR created_by_id = current_setting('app.current_user_id')
    );

-- Policy: Only ADMIN can modify data
CREATE POLICY admin_full_access ON surat_masuk
    FOR ALL
    USING (current_setting('app.current_user_role') = 'ADMIN');
```

### 2. Triggers for Auto-Update

```sql
-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_surat_masuk_updated_at 
    BEFORE UPDATE ON surat_masuk
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_disposisi_updated_at 
    BEFORE UPDATE ON disposisi
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_surat_keluar_updated_at 
    BEFORE UPDATE ON surat_keluar
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_surat_tamu_updated_at 
    BEFORE UPDATE ON surat_tamu
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 3. Audit Trigger (Optional)

```sql
-- Auto-log all changes to audit_logs
CREATE OR REPLACE FUNCTION log_data_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO audit_logs (id, action, entity, entity_id, details)
        VALUES (
            gen_random_uuid()::text,
            'DELETE',
            TG_TABLE_NAME,
            OLD.id,
            row_to_json(OLD)::text
        );
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO audit_logs (id, action, entity, entity_id, details)
        VALUES (
            gen_random_uuid()::text,
            'UPDATE',
            TG_TABLE_NAME,
            NEW.id,
            json_build_object('old', row_to_json(OLD), 'new', row_to_json(NEW))::text
        );
        RETURN NEW;
    ELSIF (TG_OP = 'INSERT') THEN
        INSERT INTO audit_logs (id, action, entity, entity_id, details)
        VALUES (
            gen_random_uuid()::text,
            'CREATE',
            TG_TABLE_NAME,
            NEW.id,
            row_to_json(NEW)::text
        );
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;
```

---

## 📊 Index Strategy

### Index Types Used

1. **B-Tree Indexes** (Default)
   - Primary keys
   - Foreign keys
   - Unique constraints
   - Date range queries

2. **GIN Indexes** (Generalized Inverted Index)
   - Full-text search on perihal
   - JSON data in audit_logs.details

3. **Partial Indexes**
   - Nullable unique constraints (nomor_surat, nomor_disposisi)
   - Active records only filters

### Index Maintenance

```sql
-- Reindex periodically for performance
REINDEX TABLE surat_masuk;
REINDEX TABLE disposisi;

-- Analyze for query planner statistics
ANALYZE users;
ANALYZE surat_masuk;
ANALYZE disposisi;
ANALYZE surat_keluar;
ANALYZE surat_tamu;
ANALYZE audit_logs;

-- Vacuum to reclaim space
VACUUM ANALYZE;
```

---

## 🎯 Performance Optimization

### 1. Connection Pooling

```javascript
// Prisma connection pool configuration
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  
  // Neon serverless PostgreSQL
  // Connection pooling enabled automatically
}
```

### 2. Query Optimization Examples

```sql
-- Efficient pagination with OFFSET FETCH
SELECT * FROM surat_masuk
ORDER BY tanggal_surat DESC
LIMIT 10 OFFSET 0;

-- Use prepared statements (via Prisma)
-- Prevents SQL injection and improves performance

-- Materialized view for dashboard stats (future)
CREATE MATERIALIZED VIEW dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM surat_masuk) as total_surat_masuk,
    (SELECT COUNT(*) FROM surat_keluar) as total_surat_keluar,
    (SELECT COUNT(*) FROM disposisi) as total_disposisi,
    (SELECT COUNT(*) FROM disposisi WHERE status = 'SELESAI') as disposisi_selesai;

-- Refresh materialized view periodically
REFRESH MATERIALIZED VIEW dashboard_stats;
```

### 3. Caching Strategy

```javascript
// Application-level caching with Redis (future enhancement)
// Cache frequently accessed data:
// - Dashboard statistics (TTL: 5 minutes)
// - User sessions (TTL: 24 hours)
// - Dropdown options (TTL: 1 hour)
```

---

## 💾 Backup & Recovery

### Backup Strategy

```bash
# Daily automated backup
pg_dump -h hostname -U username -d database_name > backup_$(date +%Y%m%d).sql

# Backup with compression
pg_dump -h hostname -U username -d database_name | gzip > backup_$(date +%Y%m%d).sql.gz

# Backup specific tables only
pg_dump -h hostname -U username -d database_name -t users -t surat_masuk > backup_critical.sql
```

### Recovery Commands

```bash
# Restore from backup
psql -h hostname -U username -d database_name < backup_20251201.sql

# Restore from compressed backup
gunzip -c backup_20251201.sql.gz | psql -h hostname -U username -d database_name
```

### Point-in-Time Recovery (PITR)

Neon Database provides automatic PITR with:
- Continuous incremental backups
- 7-day retention (free tier)
- 30-day retention (paid tier)
- Instant restore to any point in time

---

## 📈 Monitoring Queries

### Database Size

```sql
-- Total database size
SELECT pg_size_pretty(pg_database_size('database_name'));

-- Table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Index Usage

```sql
-- Unused indexes
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
WHERE idx_scan = 0
ORDER BY tablename, indexname;

-- Index hit ratio (should be > 95%)
SELECT 
    sum(idx_blks_hit) / nullif(sum(idx_blks_hit + idx_blks_read), 0) * 100 AS index_hit_ratio
FROM pg_statio_user_indexes;
```

### Slow Queries

```sql
-- Enable query logging in postgresql.conf
-- log_min_duration_statement = 1000  # Log queries > 1 second

-- View slow queries
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    max_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

---

## 🔧 Maintenance Scripts

### Routine Maintenance

```sql
-- Run weekly
VACUUM ANALYZE;

-- Run monthly
REINDEX DATABASE database_name;

-- Update statistics
ANALYZE;

-- Check for bloat
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS table_size,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) AS indexes_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## 📊 Database Schema Diagram (ASCII)

```
┌────────────────────────────────────────────────────────────────────┐
│                      PHYSICAL DATABASE SCHEMA                       │
│                        PostgreSQL 14.x                              │
└────────────────────────────────────────────────────────────────────┘

┌─────────────────┐
│     users       │
├─────────────────┤
│ PK id           │───┐
│    email        │   │
│    name         │   │
│    password     │   │
│    role         │   │
│    created_at   │   │
│    updated_at   │   │
└─────────────────┘   │
                      │ FK created_by_id
                      │
    ┌─────────────────┴──────────────────┐
    │                                    │
┌───▼──────────────┐              ┌─────▼─────────────┐
│  surat_masuk     │              │  surat_keluar     │
├──────────────────┤              ├───────────────────┤
│ PK id            │──┐           │ PK id             │
│ UK no_urut       │  │           │ UK no_urut        │
│ UK nomor_surat   │  │           │    klas           │
│    tanggal_surat │  │           │    pengolah       │
│    tanggal_diter │  │           │    tanggal_surat  │
│    asal_surat    │  │           │    perihal_surat  │
│    perihal       │  │           │    kirim_kepada   │
│    keterangan    │  │           │    created_at     │
│    file_path     │  │           │    updated_at     │
│    created_at    │  │           │ FK surat_masuk_id │
│    updated_at    │  │           │ FK created_by_id  │
│ FK created_by_id │  │           └───────────────────┘
└──────────────────┘  │                    ▲
                      │                    │
                      │ FK surat_masuk_id  │
                      │                    │
                      │                    │
    ┌─────────────────┴────────────────────┘
    │
┌───▼──────────────┐
│   disposisi      │
├──────────────────┤
│ PK id            │
│ UK nomor_disp    │
│    no_urut       │
│    tanggal_disp  │
│    tujuan_disp   │
│    isi_disposisi │
│    keterangan    │
│    status        │
│    created_at    │
│    updated_at    │
│ FK surat_masuk_id│
│ FK created_by_id │
└──────────────────┘


┌──────────────────┐         ┌──────────────────┐
│  surat_tamu      │         │   audit_logs     │
├──────────────────┤         ├──────────────────┤
│ PK id            │         │ PK id            │
│ UK no_urut       │         │    user_id       │
│    nama          │         │    action        │
│    keperluan     │         │    entity        │
│    asal_surat    │         │    entity_id     │
│    tujuan_surat  │         │    ip_address    │
│    nomor_telpon  │         │    user_agent    │
│    tanggal       │         │    details       │
│    created_at    │         │    success       │
│    updated_at    │         │    created_at    │
│ FK created_by_id │         └──────────────────┘
└──────────────────┘
```

---

**Dibuat pada**: 1 Desember 2025  
**Versi**: 1.0  
**Sistem**: Arsip DPRD Provinsi Kalimantan Selatan  
**DBMS**: PostgreSQL 14.x (Neon Serverless)  
**ORM**: Prisma 6.17.0
