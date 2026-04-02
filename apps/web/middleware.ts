import { NextResponse, type NextRequest } from 'next/server'

const WORKOS_COOKIE_NAME = process.env.WORKOS_COOKIE_NAME || 'wos-session'

export function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers)
  const sessionCookie = request.cookies.get(WORKOS_COOKIE_NAME)?.value

  requestHeaders.set('x-workos-middleware', 'true')
  requestHeaders.set('x-url', request.url)

  if (sessionCookie) {
    requestHeaders.set('x-workos-session', sessionCookie)
  } else {
    requestHeaders.delete('x-workos-session')
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders
    }
  })
}

export const config = {
  matcher: ['/auth/complete', '/v1/:path*']
}
