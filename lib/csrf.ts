import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from './auth'

/**
 * CSRF Protection Library
 * Menggunakan Double Submit Cookie pattern untuk mencegah CSRF attacks
 */

const CSRF_TOKEN_LENGTH = 32
// Use __Host- prefix only in production (requires HTTPS)
const CSRF_COOKIE_NAME = process.env.NODE_ENV === 'production' ? '__Host-csrf-token' : 'csrf-token'
const CSRF_HEADER_NAME = 'x-csrf-token'

/**
 * Generate random CSRF token
 */
function generateToken(): string {
  const array = new Uint8Array(CSRF_TOKEN_LENGTH)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Get atau generate CSRF token dari request
 */
export function getCsrfToken(request: NextRequest): string {
  // Cek existing token di cookie
  const existingToken = request.cookies.get(CSRF_COOKIE_NAME)?.value
  
  if (existingToken && existingToken.length === CSRF_TOKEN_LENGTH * 2) {
    return existingToken
  }
  
  // Generate new token
  return generateToken()
}

/**
 * Set CSRF token ke response cookie
 */
export function setCsrfCookie(response: NextResponse, token: string): NextResponse {
  response.cookies.set(CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24, // 24 hours
  })
  
  return response
}

/**
 * Validate CSRF token dari request
 */
export async function validateCsrfToken(request: NextRequest): Promise<boolean> {
  // Skip validation untuk GET, HEAD, OPTIONS (safe methods)
  const method = request.method.toUpperCase()
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    return true
  }
  
  // Skip validation untuk NextAuth routes (mereka punya CSRF sendiri)
  if (request.nextUrl.pathname.startsWith('/api/auth')) {
    return true
  }
  
  // Skip validation jika tidak ada session (endpoint public)
  const session = await getServerSession(authOptions)
  if (!session) {
    return true // Let authentication middleware handle it
  }
  
  // Get token dari cookie
  const cookieToken = request.cookies.get(CSRF_COOKIE_NAME)?.value
  
  // Get token dari header
  const headerToken = request.headers.get(CSRF_HEADER_NAME)
  
  // Validate: both must exist and match
  if (!cookieToken || !headerToken) {
    return false
  }
  
  if (cookieToken !== headerToken) {
    return false
  }
  
  return true
}

/**
 * Middleware untuk CSRF protection
 * Usage: wrap your API route handler dengan ini
 */
export async function withCsrfProtection(
  request: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  const isValid = await validateCsrfToken(request)
  
  if (!isValid) {
    return NextResponse.json(
      { 
        error: 'Invalid CSRF token',
        message: 'Request rejected due to invalid CSRF token. Please refresh the page and try again.'
      },
      { status: 403 }
    )
  }
  
  // Execute handler
  const response = await handler(request)
  
  // Set CSRF token untuk next request
  const token = getCsrfToken(request)
  return setCsrfCookie(response, token)
}

/**
 * API route untuk mendapatkan CSRF token
 * Frontend akan call ini untuk mendapatkan token
 */
export function createCsrfTokenResponse(request: NextRequest): NextResponse {
  const token = getCsrfToken(request)
  
  const response = NextResponse.json({ 
    csrfToken: token,
    message: 'CSRF token generated successfully'
  })
  
  return setCsrfCookie(response, token)
}
