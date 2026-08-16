import { NextResponse, type NextRequest } from 'next/server'
import { getSessionFromToken, SESSION_COOKIE_NAME } from '@/lib/auth/session'

// Public routes that don't require auth
const PUBLIC_ROUTES = [
  '/login',
  '/admin/login',
  '/admin/setup', // bootstrap super admin
]

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Skip static assets and Next internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') // files like favicon.ico
  ) {
    return NextResponse.next()
  }

  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value
  const session = await getSessionFromToken(token)

  // Route classification
  const isAdminRoute = pathname.startsWith('/admin')
  const isGymRoute = !isAdminRoute && !PUBLIC_ROUTES.includes(pathname)
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname)

  // If logged-in user visits a login page → redirect to their dashboard
  if (isPublicRoute && session) {
    if (session.role === 'admin') return NextResponse.redirect(new URL('/admin', req.url))
    if (session.role === 'gym') return NextResponse.redirect(new URL('/', req.url))
  }

  // Admin routes require admin session
  if (isAdminRoute && pathname !== '/admin/login' && pathname !== '/admin/setup') {
    if (!session || session.role !== 'admin') {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
  }

  // Gym routes (anything not /admin, not /login, not /logout, not /admin/setup)
  // require gym session
  if (isGymRoute && pathname !== '/logout') {
    if (!session || session.role !== 'gym') {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
