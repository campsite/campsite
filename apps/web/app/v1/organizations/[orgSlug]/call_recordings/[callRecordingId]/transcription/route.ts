import { NextResponse } from 'next/server'

import { getCallsCompatClient } from '../../../calls/_compat'

import { routeErrorResponse } from '@/lib/routeErrors'
import { getRouteAccess, routeUnauthorizedResponse } from '@/lib/routeSession'

interface Context {
  params: Promise<{ orgSlug: string; callRecordingId: string }>
}

export async function GET(_: Request, context: Context) {
  const auth = await getRouteAccess()
  const { orgSlug, callRecordingId } = await context.params

  if (!auth) {
    return routeUnauthorizedResponse()
  }

  const client = getCallsCompatClient(auth.accessToken)

  try {
    return NextResponse.json(
      await client.getRecordingTranscription({
        slug: orgSlug,
        callRecordingId
      })
    )
  } catch (error) {
    return routeErrorResponse(error)
  }
}
