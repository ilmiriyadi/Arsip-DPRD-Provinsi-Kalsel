import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const { pathname } = req.nextUrl

    // Redirect ke login jika tidak ada token
    if (!token && pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    // Admin routes - hanya admin yang bisa akses
    const adminRoutes = [
      '/dashboard/admin',
      '/dashboard/surat-masuk/add',
      '/dashboard/surat-masuk/edit',
      '/dashboard/disposisi/add',
      '/dashboard/disposisi/edit',
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
        const publicPaths = ['/login', '/register', '/']
        if (publicPaths.includes(pathname)) return true
        
        // Dashboard memerlukan authentication
        if (pathname.startsWith('/dashboard')) {
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
    '/login',
    '/register'
  ]
}