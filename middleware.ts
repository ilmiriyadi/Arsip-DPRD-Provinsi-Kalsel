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

    // Admin routes - hanya admin yang bisa akses
    const adminRoutes = [
      '/dashboard/admin',
      '/dashboard/surat-masuk/add',
      '/dashboard/surat-masuk/edit',
      '/dashboard/disposisi/add',
      '/dashboard/disposisi/edit',
      // arsip variant
      '/arsip/dashboard/admin',
      '/arsip/dashboard/surat-masuk/add',
      '/arsip/dashboard/surat-masuk/edit',
      '/arsip/dashboard/disposisi/add',
      '/arsip/dashboard/disposisi/edit',
    ]

    const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route))
    
    if (isAdminRoute && token?.role !== 'ADMIN') {
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
      '/tamu/login',
      '/register'
  ]
}