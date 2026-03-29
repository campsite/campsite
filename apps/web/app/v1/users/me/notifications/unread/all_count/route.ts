import { withAuth } from '@workos-inc/authkit-nextjs'
import { NextResponse } from 'next/server'

import { getLegacyUnreadNotificationCounts } from '@/lib/convex/notifications'
import { ensureWorkspace } from '@/lib/convex/server'

export async function GET() {
  const { accessToken, user } = await withAuth()

  if (!user || !accessToken) {
    return NextResponse.json({ inbox: {}, messages: {}, activity: {}, home_inbox: {} })
  }

  await ensureWorkspace(accessToken, user)

  return NextResponse.json(await getLegacyUnreadNotificationCounts(accessToken))
}
