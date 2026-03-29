import { withAuth } from '@workos-inc/authkit-nextjs'
import { NextResponse } from 'next/server'

import { ensureWorkspace } from '@/lib/convex/server'

export async function getRouteAccess(): Promise<{ accessToken: string } | null> {
  const { accessToken, user } = await withAuth()

  if (!user || !accessToken) {
    return null
  }

  await ensureWorkspace(accessToken, user)

  return { accessToken }
}

export function routeUnauthorizedResponse() {
  return NextResponse.json({ code: 'unauthorized', message: 'Sign in required' }, { status: 401 })
}
