import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const { pathname } = req.nextUrl

    // Clone response untuk menambahkan security headers
    const response = NextResponse.next()

    // Security Headers - Apply to ALL responses
    response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-XSS-Protection', '1; mode=block')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=(), payment=(), usb=()')
    response.headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https://*.neon.tech https://vercel.live; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests")
    
    // Remove wildcard CORS
    response.headers.delete('Access-Control-Allow-Origin')
    
    // Redirect ke login jika tidak ada token
    if (!token) {
      if (pathname.startsWith('/arsip/dashboard') || pathname.startsWith('/arsip/surat') || pathname.startsWith('/arsip/disposisi') || pathname.startsWith('/arsip/settings') || pathname.startsWith('/arsip/admin')) return NextResponse.redirect(new URL('/arsip/login', req.url))
      if (pathname.startsWith('/tamu/dashboard')) return NextResponse.redirect(new URL('/tamu/login', req.url))
    }

    // Arsip routes - hanya bisa diakses ADMIN
    const arsipRoutes = ['/arsip/dashboard', '/arsip/surat-masuk', '/arsip/surat-keluar', '/arsip/disposisi', '/arsip/settings', '/arsip/admin']
    
    // Tamu routes - hanya bisa diakses MEMBER
    const tamuRoutes = ['/tamu/dashboard', '/surat-tamu']

    const isArsipRoute = arsipRoutes.some(route => pathname.startsWith(route))
    const isTamuRoute = tamuRoutes.some(route => pathname.startsWith(route))
    
    // Redirect MEMBER dari halaman arsip ke tamu dashboard
    if (isArsipRoute && token?.role !== 'ADMIN') {
      const redirectResponse = NextResponse.redirect(new URL('/tamu/dashboard', req.url))
      // Apply security headers to redirect
      redirectResponse.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
      redirectResponse.headers.set('X-Content-Type-Options', 'nosniff')
      redirectResponse.headers.set('X-Frame-Options', 'DENY')
      return redirectResponse
    }

    // Redirect ADMIN dari halaman tamu ke arsip dashboard
    if (isTamuRoute && token?.role !== 'MEMBER') {
      const redirectResponse = NextResponse.redirect(new URL('/arsip/dashboard', req.url))
      // Apply security headers to redirect
      redirectResponse.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
      redirectResponse.headers.set('X-Content-Type-Options', 'nosniff')
      redirectResponse.headers.set('X-Frame-Options', 'DENY')
      return redirectResponse
    }

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