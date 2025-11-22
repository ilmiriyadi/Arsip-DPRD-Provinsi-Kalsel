/**
 * Rate Limiter Middleware
 * Membatasi jumlah request untuk mencegah brute force attacks
 */

interface RateLimitStore {
  count: number
  resetTime: number
}

const store = new Map<string, RateLimitStore>()

interface RateLimitOptions {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Max requests per window
}

export function rateLimit(options: RateLimitOptions) {
  return (identifier: string): { allowed: boolean; retryAfter?: number } => {
    const now = Date.now()
    const record = store.get(identifier)

    // Clean up expired entries periodically
    if (store.size > 10000) {
      for (const [key, value] of store.entries()) {
        if (value.resetTime < now) {
          store.delete(key)
        }
      }
    }

    if (!record || record.resetTime < now) {
      // New window
      store.set(identifier, {
        count: 1,
        resetTime: now + options.windowMs,
      })
      return { allowed: true }
    }

    if (record.count >= options.maxRequests) {
      // Rate limit exceeded
      const retryAfter = Math.ceil((record.resetTime - now) / 1000)
      return { allowed: false, retryAfter }
    }

    // Increment counter
    record.count++
    return { allowed: true }
  }
}

// Login rate limiter: 5 attempts per 15 minutes
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5,
})

// API rate limiter: 100 requests per minute
export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100,
})
