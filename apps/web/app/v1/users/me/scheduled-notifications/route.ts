import { NextResponse } from 'next/server'

import { createLegacyScheduledNotification, getLegacyScheduledNotifications } from '@/lib/convex/notifications'
import { routeErrorResponse } from '@/lib/routeErrors'
import { getRouteAccess } from '@/lib/routeSession'

export async function GET() {
  try {
    const auth = await getRouteAccess()

    if (!auth) {
      return NextResponse.json([])
    }

    return NextResponse.json(await getLegacyScheduledNotifications(auth.accessToken))
  } catch (error) {
    return routeErrorResponse(error)
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getRouteAccess()

    if (!auth) {
      return NextResponse.json({ code: 'unauthorized', message: 'Sign in required' }, { status: 401 })
    }

    const body = await request.json()

    return NextResponse.json(
      await createLegacyScheduledNotification(auth.accessToken, {
        name: body.name,
        timeZone: body.time_zone,
        deliveryDay: body.delivery_day,
        deliveryTime: body.delivery_time
      })
    )
  } catch (error) {
    return routeErrorResponse(error)
  }
}
