import { withAuth } from '@workos-inc/authkit-nextjs'
import { NextResponse } from 'next/server'

import { deleteLegacyNotification } from '@/lib/convex/notifications'
import { ensureWorkspace } from '@/lib/convex/server'

interface Context {
  params: Promise<{ orgSlug: string; notificationId: string }>
}

export async function DELETE(request: Request, context: Context) {
  const { accessToken, user } = await withAuth()
  const { orgSlug, notificationId } = await context.params

  if (!user || !accessToken) {
    return NextResponse.json({ code: 'unauthorized', message: 'Sign in required' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))

  await ensureWorkspace(accessToken, user)
  await deleteLegacyNotification(accessToken, {
    slug: orgSlug,
    notificationId,
    archiveBy: body.archive_by
  })

  return NextResponse.json({})
}
