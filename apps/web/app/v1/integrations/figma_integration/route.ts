import { NextResponse } from 'next/server'

import { getLegacyFigmaIntegration } from '@/lib/convex/externalPlatforms'
import { routeErrorResponse } from '@/lib/routeErrors'
import { getRouteAccess, routeUnauthorizedResponse } from '@/lib/routeSession'

export async function GET() {
  const auth = await getRouteAccess()

  if (!auth) {
    return routeUnauthorizedResponse()
  }

  try {
    return NextResponse.json(await getLegacyFigmaIntegration(auth.accessToken))
  } catch (error) {
    return routeErrorResponse(error)
  }
}
