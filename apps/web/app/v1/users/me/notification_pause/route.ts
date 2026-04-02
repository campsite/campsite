import { withAuth } from '@workos-inc/authkit-nextjs'
import { NextResponse } from 'next/server'

import { createLegacyNotificationPause, deleteLegacyNotificationPause } from '@/lib/convex/notifications'
import { ensureWorkspace } from '@/lib/convex/server'

export async function POST(request: Request) {
  const { accessToken, user } = await withAuth()

  if (!user || !accessToken) {
    return NextResponse.json({ code: 'unauthorized', message: 'Sign in required' }, { status: 401 })
  }

  const body = await request.json()

  await ensureWorkspace(accessToken, user)
  await createLegacyNotificationPause(accessToken, new Date(body.expires_at).getTime())

  return NextResponse.json({})
}

export async function DELETE() {
  const { accessToken, user } = await withAuth()

  if (!user || !accessToken) {
    return NextResponse.json({ code: 'unauthorized', message: 'Sign in required' }, { status: 401 })
  }

  await ensureWorkspace(accessToken, user)
  await deleteLegacyNotificationPause(accessToken)

  return NextResponse.json({})
}
