import { prisma } from './prisma'

export type AuditAction = 
  | 'LOGIN'
  | 'LOGOUT'
  | 'FAILED_LOGIN'
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'EXPORT'
  | 'VIEW'

export type AuditEntity = 
  | 'User'
  | 'SuratMasuk'
  | 'SuratKeluar'
  | 'Disposisi'
  | 'SuratTamu'
  | 'System'

interface AuditLogParams {
  userId?: string
  action: AuditAction
  entity?: AuditEntity
  entityId?: string
  ipAddress?: string
  userAgent?: string
  details?: Record<string, any>
  success?: boolean
}

/**
 * Log security events dan perubahan data penting
 * Digunakan untuk compliance dan investigasi security incidents
 */
export async function logAudit({
  userId,
  action,
  entity,
  entityId,
  ipAddress,
  userAgent,
  details,
  success = true
}: AuditLogParams) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        ipAddress,
        userAgent,
        details: details ? JSON.stringify(details) : null,
        success
      }
    })
  } catch (error) {
    // Jangan throw error dari audit log agar tidak mengganggu flow aplikasi
    console.error('Failed to create audit log:', error)
  }
}

/**
 * Helper untuk extract IP address dari request
 */
export function getIpAddress(request: Request): string {
  // Vercel menyimpan IP di header x-forwarded-for
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }
  
  return 'unknown'
}

/**
 * Helper untuk extract user agent dari request
 */
export function getUserAgent(request: Request): string {
  return request.headers.get('user-agent') || 'unknown'
}

/**
 * Query audit logs dengan filtering
 */
export async function getAuditLogs({
  userId,
  action,
  entity,
  startDate,
  endDate,
  limit = 100,
  page = 1
}: {
  userId?: string
  action?: AuditAction
  entity?: AuditEntity
  startDate?: Date
  endDate?: Date
  limit?: number
  page?: number
}) {
  const where: any = {}
  
  if (userId) where.userId = userId
  if (action) where.action = action
  if (entity) where.entity = entity
  if (startDate || endDate) {
    where.createdAt = {}
    if (startDate) where.createdAt.gte = startDate
    if (endDate) where.createdAt.lte = endDate
  }
  
  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: (page - 1) * limit
    }),
    prisma.auditLog.count({ where })
  ])
  
  return {
    logs,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  }
}

/**
 * Get failed login attempts untuk monitoring
 */
export async function getFailedLoginAttempts({
  hours = 24,
  limit = 50
}: {
  hours?: number
  limit?: number
} = {}) {
  const since = new Date()
  since.setHours(since.getHours() - hours)
  
  return prisma.auditLog.findMany({
    where: {
      action: 'FAILED_LOGIN',
      createdAt: { gte: since }
    },
    orderBy: { createdAt: 'desc' },
    take: limit
  })
}

/**
 * Get user activity summary
 */
export async function getUserActivitySummary(userId: string, days = 30) {
  const since = new Date()
  since.setDate(since.getDate() - days)
  
  const logs = await prisma.auditLog.findMany({
    where: {
      userId,
      createdAt: { gte: since }
    },
    orderBy: { createdAt: 'desc' }
  })
  
  // Group by action
  const summary = logs.reduce((acc, log) => {
    acc[log.action] = (acc[log.action] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  return {
    totalActions: logs.length,
    summary,
    lastActivity: logs[0]?.createdAt
  }
}
