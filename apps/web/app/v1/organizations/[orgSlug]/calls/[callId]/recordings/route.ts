import { NextResponse } from 'next/server'

import { getCallsCompatClient, parseOptionalInteger } from '../../_compat'

import { routeErrorResponse } from '@/lib/routeErrors'
import { getRouteAccess, routeUnauthorizedResponse } from '@/lib/routeSession'

interface Context {
  params: Promise<{ orgSlug: string; callId: string }>
}

export async function GET(request: Request, context: Context) {
  const auth = await getRouteAccess()
  const { orgSlug, callId } = await context.params

  if (!auth) {
    return routeUnauthorizedResponse()
  }

  const searchParams = new URL(request.url).searchParams
  const client = getCallsCompatClient(auth.accessToken)

  try {
    return NextResponse.json(
      await client.getRecordingsPage({
        slug: orgSlug,
        callId,
        after: searchParams.get('after') || undefined,
        limit: parseOptionalInteger(searchParams.get('limit'))
      })
    )
  } catch (error) {
    return routeErrorResponse(error)
  }
}
