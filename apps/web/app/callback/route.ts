import { getWorkOS, saveSession } from '@workos-inc/authkit-nextjs'
import * as Sentry from '@sentry/nextjs'
import { NextResponse } from 'next/server'

import { DESKTOP_APP_PROTOCOL } from '@campsite/config'

import { createDesktopSessionGrant } from '@/lib/convex/desktopSessions'
import { ensureWorkspace } from '@/lib/convex/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function decodeAuthState(state?: string | null): { desktop: boolean; from?: string | null } {
  if (!state) {
    return { desktop: false, from: null }
  }

  try {
    const decoded = JSON.parse(Buffer.from(state, 'base64url').toString('utf8'))

    return {
      desktop: decoded?.desktop === true,
      from: typeof decoded?.from === 'string' ? decoded.from : null
    }
  } catch {
    return {
      desktop: false,
      from: null
    }
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const { desktop, from } = decodeAuthState(url.searchParams.get('state'))

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=auth-callback', url))
  }

  try {
    const { accessToken, refreshToken, user, impersonator } = await getWorkOS().userManagement.authenticateWithCode({
      clientId: (process.env.WORKOS_CLIENT_ID || process.env.NEXT_PUBLIC_WORKOS_CLIENT_ID)!,
      code
    })

    if (!accessToken || !refreshToken || !user) {
      throw new Error('Missing WorkOS session tokens')
    }

    await saveSession({ accessToken, refreshToken, user, impersonator }, request.url)
    await ensureWorkspace(accessToken, user)

    if (desktop) {
      const grant = await createDesktopSessionGrant(accessToken, {
        refreshToken,
        userJson: JSON.stringify(user),
        impersonatorJson: impersonator ? JSON.stringify(impersonator) : undefined,
        returnTo: from || '/'
      })

      const desktopUrl = new URL(`${DESKTOP_APP_PROTOCOL}auth/desktop`)

      desktopUrl.searchParams.set('grant', grant.grantId)
      desktopUrl.searchParams.set('from', from || '/')

      return NextResponse.redirect(desktopUrl.toString())
    }

    return NextResponse.redirect(new URL(from || '/auth/complete', url))
  } catch (error) {
    Sentry.captureException(error)

    return NextResponse.redirect(new URL('/login?error=auth-callback', url))
  }
}
