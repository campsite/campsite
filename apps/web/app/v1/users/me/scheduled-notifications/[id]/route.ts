import { NextResponse } from 'next/server'

import { deleteLegacyScheduledNotification, updateLegacyScheduledNotification } from '@/lib/convex/notifications'
import { routeErrorResponse } from '@/lib/routeErrors'
import { getRouteAccess } from '@/lib/routeSession'

interface Context {
  params: Promise<{ id: string }>
}

export async function PUT(request: Request, context: Context) {
  try {
    const auth = await getRouteAccess()

    if (!auth) {
      return NextResponse.json({ code: 'unauthorized', message: 'Sign in required' }, { status: 401 })
    }

    const { id } = await context.params
    const body = await request.json()

    return NextResponse.json(
      await updateLegacyScheduledNotification(auth.accessToken, {
        id,
        timeZone: body.time_zone,
        deliveryDay: body.delivery_day,
        deliveryTime: body.delivery_time
      })
    )
  } catch (error) {
    return routeErrorResponse(error)
  }
}

export async function DELETE(_request: Request, context: Context) {
  try {
    const auth = await getRouteAccess()

    if (!auth) {
      return NextResponse.json({ code: 'unauthorized', message: 'Sign in required' }, { status: 401 })
    }

    const { id } = await context.params

    await deleteLegacyScheduledNotification(auth.accessToken, id)

    return NextResponse.json({})
  } catch (error) {
    return routeErrorResponse(error)
  }
}
