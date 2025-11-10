import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const { pathname } = req.nextUrl

    // Redirect ke login jika tidak ada token
    if (!token) {
      if (pathname.startsWith('/dashboard')) return NextResponse.redirect(new URL('/login', req.url))
      if (pathname.startsWith('/arsip/dashboard')) return NextResponse.redirect(new URL('/arsip/login', req.url))
      if (pathname.startsWith('/tamu/dashboard')) return NextResponse.redirect(new URL('/tamu/login', req.url))
    }

    // Arsip routes - hanya bisa diakses ADMIN
    const arsipRoutes = ['/dashboard', '/arsip/dashboard']
    
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
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        
  // Halaman publik
  const publicPaths = ['/login', '/register', '/', '/arsip/login', '/tamu/login']
        if (publicPaths.includes(pathname)) return true
        
        // Dashboard memerlukan authentication
        if (pathname.startsWith('/dashboard') || pathname.startsWith('/arsip/dashboard')) {
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
      '/dashboard/:path*',
      '/arsip/dashboard/:path*',
      '/tamu/dashboard/:path*',
      '/login',
      '/arsip/login',
      '/tamu/login'
  ]
}