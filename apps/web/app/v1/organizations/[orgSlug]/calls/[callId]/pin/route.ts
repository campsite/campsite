import { NextResponse } from 'next/server'

import { getCallsCompatClient } from '../../_compat'

import { routeErrorResponse } from '@/lib/routeErrors'
import { getRouteAccess, routeUnauthorizedResponse } from '@/lib/routeSession'

interface Context {
  params: Promise<{ orgSlug: string; callId: string }>
}

export async function POST(_: Request, context: Context) {
  const auth = await getRouteAccess()
  const { orgSlug, callId } = await context.params

  if (!auth) {
    return routeUnauthorizedResponse()
  }

  const client = getCallsCompatClient(auth.accessToken)

  try {
    return NextResponse.json(
      await client.createPin({
        slug: orgSlug,
        callId
      }),
      { status: 201 }
    )
  } catch (error) {
    return routeErrorResponse(error)
  }
}
