import { NextResponse } from 'next/server'

import { getCallsCompatClient, parseShowAt } from '../../_compat'
import { routeErrorResponse } from '@/lib/routeErrors'
import { getRouteAccess, routeUnauthorizedResponse } from '@/lib/routeSession'

interface Context {
  params: Promise<{ orgSlug: string; callId: string }>
}

export async function POST(request: Request, context: Context) {
  const auth = await getRouteAccess()
  const { orgSlug, callId } = await context.params

  if (!auth) {
    return routeUnauthorizedResponse()
  }

  const body = await request.json()
  const client = getCallsCompatClient(auth.accessToken)

  try {
    return NextResponse.json(
      await client.createFollowUp({
        slug: orgSlug,
        callId,
        showAt: parseShowAt(body.show_at)
      })
    )
  } catch (error) {
    return routeErrorResponse(error)
  }
}
