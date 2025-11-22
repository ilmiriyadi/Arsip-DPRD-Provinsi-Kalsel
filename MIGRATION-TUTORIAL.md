# Tutorial Run Migration Audit Log

## 📋 2 Cara Run Migration

---

## ✅ CARA 1: Via Neon Dashboard (PALING MUDAH)

### Step 1: Buka Neon Console
1. Login ke https://console.neon.tech
2. Pilih project **Arsip DPRD Kalsel**
3. Klik tab **SQL Editor**

### Step 2: Copy & Paste SQL
Copy script ini ke SQL Editor:

```sql
-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT,
    "entityId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "details" TEXT,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");
```

### Step 3: Execute
1. Klik tombol **Run** atau tekan `Ctrl+Enter`
2. Tunggu sampai muncul success message
3. ✅ Done!

### Step 4: Verify (Optional)
Cek apakah table sudah dibuat:
```sql
SELECT * FROM audit_logs LIMIT 1;
```

---

## ✅ CARA 2: Via Prisma CLI (Butuh .env.local)

### Step 1: Pastikan .env.local Ada
Buat file `.env.local` dengan DATABASE_URL:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

**Cara dapat DATABASE_URL dari Neon:**
1. Login ke Neon Console
2. Pilih project Anda
3. Klik **Connection Details**
4. Copy connection string (format: `postgresql://...`)

### Step 2: Run Migration
Buka terminal dan jalankan:

```powershell
npx prisma migrate deploy
```

**Atau** jika ingin create migration baru:

```powershell
npx prisma migrate dev --name add_audit_log
```

### Step 3: Generate Prisma Client
```powershell
npx prisma generate
```

### Step 4: Verify
```powershell
npx prisma studio
```
Buka browser, cek table `audit_logs` sudah ada.

---

## 🚀 After Migration - Deploy ke Vercel

### Step 1: Commit & Push
```powershell
git add .
git commit -m "feat: add audit logging system"
git push origin master
```

### Step 2: Vercel Auto Deploy
Vercel akan otomatis:
1. Detect push ke master
2. Build aplikasi
3. Run `prisma generate`
4. Deploy

### Step 3: Verify di Production
1. Buka aplikasi di Vercel URL
2. Login sebagai ADMIN
3. Akses: `https://your-app.vercel.app/dashboard/admin/audit-logs`
4. Coba login beberapa kali → lihat log muncul

---

## 🧪 Testing Audit Log

### Test 1: Failed Login
1. Logout
2. Login dengan password SALAH
3. Check audit logs → harus ada `FAILED_LOGIN`

### Test 2: Successful Login
1. Login dengan credentials benar
2. Check audit logs → harus ada `LOGIN`

### Test 3: Create User
1. Login sebagai ADMIN
2. Buat user baru di `/dashboard/admin/users`
3. Check audit logs → harus ada `CREATE` untuk User

### Expected Data:
```
Action: FAILED_LOGIN
Entity: User
IP Address: 192.168.x.x
Details: { "email": "...", "reason": "invalid_password" }
Success: false
```

---

## ❌ Troubleshooting

### Error: "Environment variable not found: DATABASE_URL"
**Solution**: Buat file `.env.local` dengan DATABASE_URL dari Neon

### Error: "relation audit_logs does not exist"
**Solution**: Migration belum dijalankan. Gunakan Cara 1 (Neon Dashboard)

### Error: "Prisma Client is not generated"
**Solution**: Run `npx prisma generate`

### Audit logs tidak muncul di UI
**Checklist**:
1. ✅ Migration sudah dijalankan?
2. ✅ Login sebagai ADMIN?
3. ✅ Sudah coba failed login untuk generate log?
4. ✅ Check browser console untuk errors

---

## 📊 Verify Migration Success

### Via Neon SQL Editor:
```sql
-- Check table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'audit_logs';

-- Check columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'audit_logs';

-- Check indexes
SELECT indexname 
FROM pg_indexes 
WHERE tablename = 'audit_logs';
```

Expected results:
- Table: `audit_logs` ✅
- Columns: id, userId, action, entity, entityId, ipAddress, userAgent, details, success, createdAt ✅
- Indexes: 3 indexes (userId, action, createdAt) ✅

---

## ✅ Rekomendasi: Gunakan CARA 1 (Neon Dashboard)

**Kenapa?**
- ✅ Tidak butuh .env.local di local
- ✅ Tidak butuh Prisma CLI
- ✅ Langsung ke production database
- ✅ Cepat & simple
- ✅ Bisa verify langsung

**Setelah migration via Neon, tetap perlu run di local:**
```powershell
npx prisma generate
```
Ini untuk update Prisma Client di local development.

---

## 🎯 Summary

1. **Production (Neon)**: Run SQL manual via Neon Dashboard
2. **Local Development**: Run `npx prisma generate` untuk sync client
3. **Deploy**: Git push → Vercel auto deploy
4. **Test**: Login/logout beberapa kali, check `/dashboard/admin/audit-logs`

**Done! Audit logging system ready to use!** 🎉
