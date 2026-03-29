import { NextResponse } from 'next/server'

import {
  deleteLegacyNotificationSchedule,
  getLegacyNotificationSchedule,
  updateLegacyNotificationSchedule
} from '@/lib/convex/notifications'
import { routeErrorResponse } from '@/lib/routeErrors'
import { getRouteAccess } from '@/lib/routeSession'

export async function GET() {
  try {
    const auth = await getRouteAccess()

    if (!auth) {
      return NextResponse.json({ type: 'none', custom: null })
    }

    return NextResponse.json(await getLegacyNotificationSchedule(auth.accessToken))
  } catch (error) {
    return routeErrorResponse(error)
  }
}

export async function PUT(request: Request) {
  try {
    const auth = await getRouteAccess()

    if (!auth) {
      return NextResponse.json({ code: 'unauthorized', message: 'Sign in required' }, { status: 401 })
    }

    const body = await request.json()

    await updateLegacyNotificationSchedule(auth.accessToken, {
      days: body.days,
      startTime: body.start_time,
      endTime: body.end_time
    })

    return NextResponse.json({})
  } catch (error) {
    return routeErrorResponse(error)
  }
}

export async function DELETE() {
  try {
    const auth = await getRouteAccess()

    if (!auth) {
      return NextResponse.json({ code: 'unauthorized', message: 'Sign in required' }, { status: 401 })
    }

    await deleteLegacyNotificationSchedule(auth.accessToken)

    return NextResponse.json({})
  } catch (error) {
    return routeErrorResponse(error)
  }
}
