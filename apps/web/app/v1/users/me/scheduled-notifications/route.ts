import { withAuth } from '@workos-inc/authkit-nextjs'
import { NextResponse } from 'next/server'

import { createLegacyScheduledNotification, getLegacyScheduledNotifications } from '@/lib/convex/notifications'
import { ensureWorkspace } from '@/lib/convex/server'

export async function GET() {
  const { accessToken, user } = await withAuth()

  if (!user || !accessToken) {
    return NextResponse.json([])
  }

  await ensureWorkspace(accessToken, user)

  return NextResponse.json(await getLegacyScheduledNotifications(accessToken))
}

export async function POST(request: Request) {
  const { accessToken, user } = await withAuth()

  if (!user || !accessToken) {
    return NextResponse.json({ code: 'unauthorized', message: 'Sign in required' }, { status: 401 })
  }

  const body = await request.json()

  await ensureWorkspace(accessToken, user)

  return NextResponse.json(
    await createLegacyScheduledNotification(accessToken, {
      name: body.name,
      timeZone: body.time_zone,
      deliveryDay: body.delivery_day,
      deliveryTime: body.delivery_time
    })
  )
}
