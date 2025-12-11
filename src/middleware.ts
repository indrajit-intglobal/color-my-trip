import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAdmin = token?.role === 'ADMIN'
    const isAdminRoute = req.nextUrl.pathname.startsWith('/admin')
    
    // User pages that admins should not access
    const userPages = ['/profile', '/book', '/bookings']
    const isUserPage = userPages.some((page) => req.nextUrl.pathname.startsWith(page))

    // Redirect non-admins trying to access admin routes
    if (isAdminRoute && !isAdmin) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    // Redirect admins trying to access user pages to dashboard
    if (isUserPage && isAdmin) {
      return NextResponse.redirect(new URL('/admin/dashboard', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow public routes
        const publicRoutes = ['/', '/tours', '/about', '/contact', '/login', '/api']
        const isPublicRoute = publicRoutes.some((route) =>
          req.nextUrl.pathname.startsWith(route)
        )

        if (isPublicRoute) {
          return true
        }

        // Require auth for protected routes
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    '/admin/:path*',
    '/profile/:path*',
    '/bookings/:path*',
    '/book/:path*',
  ],
}

