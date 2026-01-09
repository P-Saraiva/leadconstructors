import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(req: NextRequest) {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET
  let token = null
  try {
    token = await getToken({ req, secret })
  } catch {
    token = null
  }
  const isAuthenticated = !!token
  const isDashboard = req.nextUrl.pathname.startsWith('/dashboard')

  if (isDashboard && !isAuthenticated) {
    const url = new URL('/login', req.url)
    return NextResponse.redirect(url)
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard']
}
