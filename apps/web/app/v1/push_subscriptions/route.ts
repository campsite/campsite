import { NextResponse } from 'next/server'

import { storeLegacyPushSubscription } from '@/lib/convex/realtime'
import { routeErrorResponse } from '@/lib/routeErrors'
import { getRouteAccess, routeUnauthorizedResponse } from '@/lib/routeSession'

export async function POST(request: Request) {
  const auth = await getRouteAccess()

  if (!auth) {
    return routeUnauthorizedResponse()
  }

  const body = (await request.json().catch(() => null)) as
    | {
        old_endpoint?: string | null
        new_endpoint?: string
        p256dh?: string
        auth?: string
      }
    | null

  if (!body?.new_endpoint || !body.p256dh || !body.auth) {
    return NextResponse.json({ code: 'invalid_request', message: 'Subscription payload is incomplete.' }, { status: 400 })
  }

  try {
    await storeLegacyPushSubscription(auth.accessToken, {
      oldEndpoint: body.old_endpoint ?? null,
      newEndpoint: body.new_endpoint,
      p256dh: body.p256dh,
      auth: body.auth
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    return routeErrorResponse(error)
  }
}
