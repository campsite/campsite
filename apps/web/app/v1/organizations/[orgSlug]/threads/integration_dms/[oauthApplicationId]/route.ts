import { NextResponse } from 'next/server'

import { getLegacyIntegrationDm } from '@/lib/convex/threads'
import { routeErrorResponse } from '@/lib/routeErrors'
import { getRouteAccess, routeUnauthorizedResponse } from '@/lib/routeSession'

interface Context {
  params: Promise<{ orgSlug: string; oauthApplicationId: string }>
}

export async function GET(_: Request, context: Context) {
  const auth = await getRouteAccess()
  const { oauthApplicationId, orgSlug } = await context.params

  if (!auth) {
    return routeUnauthorizedResponse()
  }

  try {
    return NextResponse.json(
      await getLegacyIntegrationDm(auth.accessToken, {
        slug: orgSlug,
        oauthApplicationId
      })
    )
  } catch (error) {
    return routeErrorResponse(error)
  }
}
