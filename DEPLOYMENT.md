# Deployment ke Vercel

## Environment Variables yang Diperlukan

Saat deploy ke Vercel, tambahkan environment variables berikut:

### 1. NEXTAUTH_SECRET
```
NEXTAUTH_SECRET=your-super-secret-key-min-32-characters
```

### 2. NEXTAUTH_URL
```
NEXTAUTH_URL=https://your-project-name.vercel.app
```

### 3. DATABASE_URL (SQLite lokal tidak bisa di cloud)
Untuk production, gunakan database cloud seperti:
- Neon (PostgreSQL) - gratis
- PlanetScale (MySQL) - gratis
- Supabase (PostgreSQL) - gratis

Contoh untuk Neon:
```
DATABASE_URL="postgresql://username:password@host/database?sslmode=require"
```

## Langkah Deploy

1. Buka https://vercel.com
2. Login dengan GitHub
3. Import repository: ilmiriyadi/Arsip-DPRD-Provinsi-Kalsel
4. Tambahkan environment variables di atas
5. Deploy!

## Database Setup

Karena SQLite tidak support di Vercel, pilih salah satu:
1. **Neon** (Recommended): https://neon.tech
2. **Supabase**: https://supabase.com
3. **PlanetScale**: https://planetscale.com

Setelah dapat DATABASE_URL, jalankan:
```bash
npx prisma db push
```