import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const { pathname } = req.nextUrl

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
      return NextResponse.redirect(new URL('/tamu/dashboard', req.url))
    }

    // Redirect ADMIN dari halaman tamu ke arsip dashboard
    if (isTamuRoute && token?.role !== 'MEMBER') {
      return NextResponse.redirect(new URL('/arsip/dashboard', req.url))
    }

    return NextResponse.next()
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
      '/arsip/dashboard/:path*',
      '/arsip/surat-masuk/:path*',
      '/arsip/surat-keluar/:path*',
      '/arsip/disposisi/:path*',
      '/arsip/settings/:path*',
      '/arsip/admin/:path*',
      '/tamu/dashboard/:path*',
      '/surat-tamu/:path*',
      '/arsip/login',
      '/tamu/login'
  ]
}