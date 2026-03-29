import { withAuth } from '@workos-inc/authkit-nextjs'
import { NextResponse } from 'next/server'

import { deleteLegacyScheduledNotification, updateLegacyScheduledNotification } from '@/lib/convex/notifications'
import { ensureWorkspace } from '@/lib/convex/server'

interface Context {
  params: Promise<{ id: string }>
}

export async function PUT(request: Request, context: Context) {
  const { accessToken, user } = await withAuth()

  if (!user || !accessToken) {
    return NextResponse.json({ code: 'unauthorized', message: 'Sign in required' }, { status: 401 })
  }

  const { id } = await context.params
  const body = await request.json()

  await ensureWorkspace(accessToken, user)

  return NextResponse.json(
    await updateLegacyScheduledNotification(accessToken, {
      id,
      timeZone: body.time_zone,
      deliveryDay: body.delivery_day,
      deliveryTime: body.delivery_time
    })
  )
}

export async function DELETE(_request: Request, context: Context) {
  const { accessToken, user } = await withAuth()

  if (!user || !accessToken) {
    return NextResponse.json({ code: 'unauthorized', message: 'Sign in required' }, { status: 401 })
  }

  const { id } = await context.params

  await ensureWorkspace(accessToken, user)
  await deleteLegacyScheduledNotification(accessToken, id)

  return NextResponse.json({})
}
