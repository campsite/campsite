import { NextResponse } from 'next/server'

import { getCallsCompatClient } from '../_compat'

import { routeErrorResponse } from '@/lib/routeErrors'
import { getRouteAccess, routeUnauthorizedResponse } from '@/lib/routeSession'

interface Context {
  params: Promise<{ orgSlug: string; callId: string }>
}

export async function GET(_: Request, context: Context) {
  const auth = await getRouteAccess()
  const { orgSlug, callId } = await context.params

  if (!auth) {
    return routeUnauthorizedResponse()
  }

  const client = getCallsCompatClient(auth.accessToken)

  try {
    return NextResponse.json(
      await client.getCallById({
        slug: orgSlug,
        callId
      })
    )
  } catch (error) {
    return routeErrorResponse(error)
  }
}

export async function PUT(request: Request, context: Context) {
  const auth = await getRouteAccess()
  const { orgSlug, callId } = await context.params

  if (!auth) {
    return routeUnauthorizedResponse()
  }

  const body = await request.json()
  const client = getCallsCompatClient(auth.accessToken)

  try {
    return NextResponse.json(
      await client.updateCall({
        slug: orgSlug,
        callId,
        title: typeof body.title === 'string' ? body.title : undefined,
        summaryHtml: typeof body.summary === 'string' ? body.summary : undefined
      })
    )
  } catch (error) {
    return routeErrorResponse(error)
  }
}
