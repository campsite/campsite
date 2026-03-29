import { NextResponse } from 'next/server'

import { createLegacyOauthAccessToken } from '@/lib/convex/collaboration'
import { routeErrorResponse } from '@/lib/routeErrors'
import { getRouteAccess, routeUnauthorizedResponse } from '@/lib/routeSession'

export async function POST(_: Request, { params }: { params: { orgSlug: string; oauthApplicationId: string } }) {
  const auth = await getRouteAccess()

  if (!auth) {
    return routeUnauthorizedResponse()
  }

  try {
    return NextResponse.json(
      await createLegacyOauthAccessToken(auth.accessToken, {
        slug: params.orgSlug,
        id: params.oauthApplicationId
      }),
      { status: 201 }
    )
  } catch (error) {
    return routeErrorResponse(error)
  }
}
