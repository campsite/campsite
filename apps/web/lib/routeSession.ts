import { refreshSession, withAuth } from '@workos-inc/authkit-nextjs'
import { NextResponse } from 'next/server'

const ACCESS_TOKEN_REFRESH_BUFFER_SECONDS = 60

function shouldRefreshAccessToken(accessToken?: string | null) {
  if (!accessToken) {
    return false
  }

  try {
    const payload = accessToken.split('.')[1]

    if (!payload) {
      return true
    }

    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/')
    const paddedPayload = normalizedPayload.padEnd(Math.ceil(normalizedPayload.length / 4) * 4, '=')
    const parsedPayload = JSON.parse(Buffer.from(paddedPayload, 'base64').toString('utf8')) as { exp?: unknown }
    const exp = parsedPayload.exp

    if (typeof exp !== 'number') {
      return false
    }

    return exp <= Math.floor(Date.now() / 1000) + ACCESS_TOKEN_REFRESH_BUFFER_SECONDS
  } catch {
    return true
  }
}

export async function getFreshRouteAuth() {
  let auth = await withAuth()

  if (!auth.user || !auth.accessToken || !shouldRefreshAccessToken(auth.accessToken)) {
    return auth
  }

  try {
    const refreshed = await refreshSession()

    if (refreshed.user && refreshed.accessToken) {
      auth = refreshed
    }
  } catch {
    // Fall back to the existing session payload and let downstream handlers decide how to respond.
  }

  return auth
}

export async function getRouteAccess(): Promise<{ accessToken: string } | null> {
  const { accessToken, user } = await getFreshRouteAuth()

  if (!user || !accessToken) {
    return null
  }

  return { accessToken }
}

export function routeUnauthorizedResponse() {
  return NextResponse.json({ code: 'unauthorized', message: 'Sign in required' }, { status: 401 })
}
