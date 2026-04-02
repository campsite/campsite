import { NextResponse } from 'next/server'

import { detachLegacyProjectOauthApplication } from '@/lib/convex/collaboration'
import { routeErrorResponse } from '@/lib/routeErrors'
import { getRouteAccess, routeUnauthorizedResponse } from '@/lib/routeSession'

export async function DELETE(_: Request, { params }: { params: { orgSlug: string; projectId: string; id: string } }) {
  const auth = await getRouteAccess()

  if (!auth) {
    return routeUnauthorizedResponse()
  }

  try {
    return NextResponse.json(
      await detachLegacyProjectOauthApplication(auth.accessToken, {
        slug: params.orgSlug,
        projectId: params.projectId,
        id: params.id
      })
    )
  } catch (error) {
    return routeErrorResponse(error)
  }
}
