import { NextResponse } from 'next/server'

import {
  attachLegacyProjectOauthApplication,
  getLegacyProjectOauthApplications
} from '@/lib/convex/collaboration'
import { routeErrorResponse } from '@/lib/routeErrors'
import { getRouteAccess, routeUnauthorizedResponse } from '@/lib/routeSession'

export async function GET(_: Request, { params }: { params: { orgSlug: string; projectId: string } }) {
  const auth = await getRouteAccess()

  if (!auth) {
    return routeUnauthorizedResponse()
  }

  try {
    return NextResponse.json(
      await getLegacyProjectOauthApplications(auth.accessToken, {
        slug: params.orgSlug,
        projectId: params.projectId
      })
    )
  } catch (error) {
    return routeErrorResponse(error)
  }
}

export async function POST(request: Request, { params }: { params: { orgSlug: string; projectId: string } }) {
  const auth = await getRouteAccess()

  if (!auth) {
    return routeUnauthorizedResponse()
  }

  const body = await request.json()

  try {
    return NextResponse.json(
      await attachLegacyProjectOauthApplication(auth.accessToken, {
        slug: params.orgSlug,
        projectId: params.projectId,
        oauthApplicationId: typeof body.oauth_application_id === 'string' ? body.oauth_application_id : ''
      })
    )
  } catch (error) {
    return routeErrorResponse(error)
  }
}
