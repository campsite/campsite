import { NextResponse } from 'next/server'

import { detachLegacyThreadOauthApplication } from '@/lib/convex/collaboration'
import { routeErrorResponse } from '@/lib/routeErrors'
import { getRouteAccess, routeUnauthorizedResponse } from '@/lib/routeSession'

export async function DELETE(_: Request, { params }: { params: { orgSlug: string; threadId: string; id: string } }) {
  const auth = await getRouteAccess()

  if (!auth) {
    return routeUnauthorizedResponse()
  }

  try {
    return NextResponse.json(
      await detachLegacyThreadOauthApplication(auth.accessToken, {
        slug: params.orgSlug,
        threadId: params.threadId,
        id: params.id
      })
    )
  } catch (error) {
    return routeErrorResponse(error)
  }
}
