import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Security headers yang akan diterapkan ke semua response
const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=(), payment=(), usb=()' },
  { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https://*.neon.tech https://vercel.live; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests" },
]

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const { pathname } = req.nextUrl

    // Redirect ke login jika tidak ada token
    if (!token) {
      if (pathname.startsWith('/arsip/dashboard') || pathname.startsWith('/arsip/surat') || pathname.startsWith('/arsip/disposisi') || pathname.startsWith('/arsip/settings') || pathname.startsWith('/arsip/admin')) {
        const response = NextResponse.redirect(new URL('/arsip/login', req.url))
        securityHeaders.forEach(({ key, value }) => response.headers.set(key, value))
        return response
      }
      if (pathname.startsWith('/tamu/dashboard')) {
        const response = NextResponse.redirect(new URL('/tamu/login', req.url))
        securityHeaders.forEach(({ key, value }) => response.headers.set(key, value))
        return response
      }
    }

    // Arsip routes - hanya bisa diakses ADMIN
    const arsipRoutes = ['/arsip/dashboard', '/arsip/surat-masuk', '/arsip/surat-keluar', '/arsip/disposisi', '/arsip/settings', '/arsip/admin']
    
    // Tamu routes - hanya bisa diakses MEMBER
    const tamuRoutes = ['/tamu/dashboard', '/surat-tamu']

    const isArsipRoute = arsipRoutes.some(route => pathname.startsWith(route))
    const isTamuRoute = tamuRoutes.some(route => pathname.startsWith(route))
    
    // Redirect MEMBER dari halaman arsip ke tamu dashboard
    if (isArsipRoute && token?.role !== 'ADMIN') {
      const response = NextResponse.redirect(new URL('/tamu/dashboard', req.url))
      securityHeaders.forEach(({ key, value }) => response.headers.set(key, value))
      return response
    }

    // Redirect ADMIN dari halaman tamu ke arsip dashboard
    if (isTamuRoute && token?.role !== 'MEMBER') {
      const response = NextResponse.redirect(new URL('/arsip/dashboard', req.url))
      securityHeaders.forEach(({ key, value }) => response.headers.set(key, value))
      return response
    }

    // Apply security headers ke normal response
    const response = NextResponse.next()
    securityHeaders.forEach(({ key, value }) => response.headers.set(key, value))
    
    return response
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        
  // Halaman publik
  const publicPaths = ['/register', '/', '/arsip/login', '/tamu/login']
        if (publicPaths.includes(pathname)) return true
        
        // Dashboard memerlukan authentication
        if (pathname.startsWith('/arsip/dashboard') || pathname.startsWith('/arsip/surat') || pathname.startsWith('/arsip/disposisi') || pathname.startsWith('/arsip/settings') || pathname.startsWith('/arsip/admin')) {
          return !!token
        }

        // Tamu dashboard requires authentication as well
        if (pathname.startsWith('/tamu/dashboard')) {
          return !!token
        }
        
        return true
      },
    },
  }
)

export const config = {
  matcher: [
      '/((?!_next/static|_next/image|favicon.ico).*)',
  ]
}