import { withAuth } from '@workos-inc/authkit-nextjs'
import { NextResponse } from 'next/server'

import {
  deleteLegacyNotificationSchedule,
  getLegacyNotificationSchedule,
  updateLegacyNotificationSchedule
} from '@/lib/convex/notifications'
import { ensureWorkspace } from '@/lib/convex/server'

export async function GET() {
  const { accessToken, user } = await withAuth()

  if (!user || !accessToken) {
    return NextResponse.json({ type: 'none', custom: null })
  }

  await ensureWorkspace(accessToken, user)

  return NextResponse.json(await getLegacyNotificationSchedule(accessToken))
}

export async function PUT(request: Request) {
  const { accessToken, user } = await withAuth()

  if (!user || !accessToken) {
    return NextResponse.json({ code: 'unauthorized', message: 'Sign in required' }, { status: 401 })
  }

  const body = await request.json()

  await ensureWorkspace(accessToken, user)
  await updateLegacyNotificationSchedule(accessToken, {
    days: body.days,
    startTime: body.start_time,
    endTime: body.end_time
  })

  return NextResponse.json({})
}

export async function DELETE() {
  const { accessToken, user } = await withAuth()

  if (!user || !accessToken) {
    return NextResponse.json({ code: 'unauthorized', message: 'Sign in required' }, { status: 401 })
  }

  await ensureWorkspace(accessToken, user)
  await deleteLegacyNotificationSchedule(accessToken)

  return NextResponse.json({})
}
