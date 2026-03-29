import { NextResponse } from 'next/server'

import { deleteLegacyThreadOauthApplication } from '@/lib/convex/threads'
import { routeErrorResponse } from '@/lib/routeErrors'
import { getRouteAccess, routeUnauthorizedResponse } from '@/lib/routeSession'

export async function DELETE(_: Request, { params }: { params: { orgSlug: string; threadId: string; id: string } }) {
  const auth = await getRouteAccess()

  if (!auth) {
    return routeUnauthorizedResponse()
  }

  try {
    return NextResponse.json(
      await deleteLegacyThreadOauthApplication(auth.accessToken, {
        slug: params.orgSlug,
        threadId: params.threadId,
        oauthApplicationId: params.id
      })
    )
  } catch (error) {
    return routeErrorResponse(error)
  }
}
