import { withAuth } from '@workos-inc/authkit-nextjs'
import { NextResponse } from 'next/server'

import { unarchiveLegacyNotification } from '@/lib/convex/notifications'
import { ensureWorkspace } from '@/lib/convex/server'

interface Context {
  params: Promise<{ orgSlug: string; notificationId: string }>
}

export async function DELETE(_request: Request, context: Context) {
  const { accessToken, user } = await withAuth()
  const { orgSlug, notificationId } = await context.params

  if (!user || !accessToken) {
    return NextResponse.json({ code: 'unauthorized', message: 'Sign in required' }, { status: 401 })
  }

  await ensureWorkspace(accessToken, user)
  await unarchiveLegacyNotification(accessToken, { slug: orgSlug, notificationId })

  return NextResponse.json({})
}
