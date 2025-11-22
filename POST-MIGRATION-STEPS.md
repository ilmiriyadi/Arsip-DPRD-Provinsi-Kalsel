# Post-Migration Steps - Enable Audit Logging

## ⚠️ IMPORTANT: Audit logging code temporarily disabled untuk allow build

Files yang perlu di-uncomment setelah migration:

---

## Step 1: Run Migration di Neon Dashboard

1. Login ke https://console.neon.tech
2. Pilih project → SQL Editor
3. Run SQL ini:

```sql
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

CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");
```

4. Verify table created:
```sql
SELECT * FROM audit_logs LIMIT 1;
```

---

## Step 2: Uncomment Audit Log Code

### File 1: `lib/auth.ts`

**Line 6** - Uncomment import:
```typescript
// BEFORE:
// import { logAudit } from "./auditLog" // Temporarily disabled until migration runs

// AFTER:
import { logAudit } from "./auditLog"
```

**Lines 23-31** - Uncomment rate limit logging:
```typescript
// BEFORE:
// TODO: Log failed login due to rate limit (after migration)
// await logAudit({ action: 'FAILED_LOGIN', entity: 'System', ... })

// AFTER:
await logAudit({
  action: 'FAILED_LOGIN',
  entity: 'System',
  details: { 
    email: credentials.email,
    reason: 'rate_limit_exceeded'
  },
  success: false
})
```

**Lines 42-50** - Uncomment user not found logging:
```typescript
// BEFORE:
// TODO: Log failed login - user not found (after migration)
// await logAudit({ action: 'FAILED_LOGIN', entity: 'User', ... })

// AFTER:
await logAudit({
  action: 'FAILED_LOGIN',
  entity: 'User',
  details: { 
    email: credentials.email,
    reason: 'user_not_found'
  },
  success: false
})
```

**Lines 59-68** - Uncomment invalid password logging:
```typescript
// BEFORE:
// TODO: Log failed login - invalid password (after migration)
// await logAudit({ userId: user.id, action: 'FAILED_LOGIN', ... })

// AFTER:
await logAudit({
  userId: user.id,
  action: 'FAILED_LOGIN',
  entity: 'User',
  details: { 
    email: credentials.email,
    reason: 'invalid_password'
  },
  success: false
})
```

**Lines 71-78** - Uncomment successful login logging:
```typescript
// BEFORE:
// TODO: Log successful login (after migration)
// await logAudit({ userId: user.id, action: 'LOGIN', ... })

// AFTER:
await logAudit({
  userId: user.id,
  action: 'LOGIN',
  entity: 'User',
  details: { 
    email: credentials.email
  },
  success: true
})
```

---

### File 2: `app/api/users/route.ts`

**Line 8** - Uncomment import:
```typescript
// BEFORE:
// import { logAudit, getIpAddress, getUserAgent } from "@/lib/auditLog" // Temporarily disabled until migration runs

// AFTER:
import { logAudit, getIpAddress, getUserAgent } from "@/lib/auditLog"
```

**Lines 143-155** - Uncomment user creation logging:
```typescript
// BEFORE:
// TODO: Log user creation (after migration)
// await logAudit({ userId: session.user.id, action: 'CREATE', entity: 'User', entityId: user.id, ... })

// AFTER:
await logAudit({
  userId: session.user.id,
  action: 'CREATE',
  entity: 'User',
  entityId: user.id,
  ipAddress: getIpAddress(req),
  userAgent: getUserAgent(req),
  details: {
    createdUserEmail: user.email,
    createdUserRole: user.role
  }
})
```

---

## Step 3: Generate Prisma Client & Redeploy

```powershell
# Generate Prisma Client
npx prisma generate

# Commit changes
git add .
git commit -m "feat: enable audit logging after migration"
git push origin master
```

---

## Step 4: Verify Audit Logging Works

1. Wait for Vercel deployment to complete
2. Visit production app
3. Try failed login → Check `/dashboard/admin/audit-logs`
4. Try successful login → Check logs
5. Create a new user (as admin) → Check logs

---

## 🎯 Quick Uncomment Script (Optional)

Atau gunakan script ini untuk uncomment semuanya sekaligus:

```powershell
# Restore lib/auth.ts
(Get-Content lib\auth.ts) -replace '// import { logAudit }', 'import { logAudit }' | Set-Content lib\auth.ts
(Get-Content lib\auth.ts) -replace '// TODO: Log', '// Log' | Set-Content lib\auth.ts
(Get-Content lib\auth.ts) -replace '// await logAudit', 'await logAudit' | Set-Content lib\auth.ts

# Restore app/api/users/route.ts
(Get-Content app\api\users\route.ts) -replace '// import { logAudit, getIpAddress, getUserAgent }', 'import { logAudit, getIpAddress, getUserAgent }' | Set-Content app\api\users\route.ts
(Get-Content app\api\users\route.ts) -replace '// TODO: Log user creation', '// Log user creation' | Set-Content app\api\users\route.ts
(Get-Content app\api\users\route.ts) -replace '// await logAudit', 'await logAudit' | Set-Content app\api\users\route.ts

# Generate Prisma Client
npx prisma generate

# Commit and push
git add .
git commit -m "feat: enable audit logging after migration"
git push origin master
```

---

## ✅ Checklist

After migration:
- [ ] Run migration SQL di Neon Dashboard
- [ ] Verify table created
- [ ] Uncomment imports in `lib/auth.ts`
- [ ] Uncomment imports in `app/api/users/route.ts`
- [ ] Uncomment all `logAudit()` calls
- [ ] Run `npx prisma generate`
- [ ] Commit & push
- [ ] Test audit logs in production

**Current Status**: Audit logging code DISABLED (allows build to pass)  
**After Migration**: Follow steps above to ENABLE

