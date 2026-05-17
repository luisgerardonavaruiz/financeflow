import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  })

  const isLoggedIn = !!token
  const isAuthPage =
    req.nextUrl.pathname.startsWith('/login') ||
    req.nextUrl.pathname.startsWith('/register')
  const isProtectedRoute = req.nextUrl.pathname.startsWith('/dashboard')

  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|icons).*)'],
}
