import { NextResponse } from 'next/server'

import { renewLegacyOauthApplicationSecret } from '@/lib/convex/collaboration'
import { routeErrorResponse } from '@/lib/routeErrors'
import { getRouteAccess, routeUnauthorizedResponse } from '@/lib/routeSession'

export async function POST(_: Request, { params }: { params: { orgSlug: string; oauthApplicationId: string } }) {
  const auth = await getRouteAccess()

  if (!auth) {
    return routeUnauthorizedResponse()
  }

  try {
    return NextResponse.json(
      await renewLegacyOauthApplicationSecret(auth.accessToken, {
        slug: params.orgSlug,
        id: params.oauthApplicationId
      })
    )
  } catch (error) {
    return routeErrorResponse(error)
  }
}
