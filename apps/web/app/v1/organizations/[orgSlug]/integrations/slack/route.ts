import { NextResponse } from 'next/server'

import { deleteLegacySlackIntegration, getLegacySlackIntegration } from '@/lib/convex/externalPlatforms'
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
    return NextResponse.json(await getLegacySlackIntegration(auth.accessToken, { slug: orgSlug }))
  } catch (error) {
    return routeErrorResponse(error)
  }
}

export async function DELETE(_request: Request, context: Context) {
  const auth = await getRouteAccess()
  const { orgSlug } = await context.params

  if (!auth) {
    return routeUnauthorizedResponse()
  }

  try {
    return NextResponse.json(await deleteLegacySlackIntegration(auth.accessToken, { slug: orgSlug }))
  } catch (error) {
    return routeErrorResponse(error)
  }
}
