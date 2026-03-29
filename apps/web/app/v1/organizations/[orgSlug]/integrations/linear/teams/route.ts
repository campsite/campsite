import { NextResponse } from 'next/server'

import { getLegacyLinearTeams } from '@/lib/convex/externalPlatforms'
import { routeErrorResponse } from '@/lib/routeErrors'
import { getRouteAccess, routeUnauthorizedResponse } from '@/lib/routeSession'

interface Context {
  params: Promise<{ orgSlug: string }>
}

export async function GET(_request: Request, context: Context) {
  const auth = await getRouteAccess()
  const { orgSlug } = await context.params

  if (!auth) {
    return routeUnauthorizedResponse()
  }

  try {
    return NextResponse.json(await getLegacyLinearTeams(auth.accessToken, { slug: orgSlug }))
  } catch (error) {
    return routeErrorResponse(error)
  }
}
