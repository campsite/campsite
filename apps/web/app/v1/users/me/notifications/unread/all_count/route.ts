import { NextResponse } from 'next/server'

import { getLegacyUnreadNotificationCounts } from '@/lib/convex/notifications'
import { routeErrorResponse } from '@/lib/routeErrors'
import { getRouteAccess } from '@/lib/routeSession'

export async function GET() {
  try {
    const auth = await getRouteAccess()

    if (!auth) {
      return NextResponse.json({ inbox: {}, messages: {}, activity: {}, home_inbox: {} })
    }

    return NextResponse.json(await getLegacyUnreadNotificationCounts(auth.accessToken))
  } catch (error) {
    return routeErrorResponse(error)
  }
}
