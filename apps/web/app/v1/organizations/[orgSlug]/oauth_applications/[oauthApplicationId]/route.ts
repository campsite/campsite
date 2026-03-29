import { NextResponse } from 'next/server'

import {
  deleteLegacyOauthApplication,
  getLegacyOauthApplicationById,
  updateLegacyOauthApplication
} from '@/lib/convex/collaboration'
import { routeErrorResponse } from '@/lib/routeErrors'
import { getRouteAccess, routeUnauthorizedResponse } from '@/lib/routeSession'

export async function GET(_: Request, { params }: { params: { orgSlug: string; oauthApplicationId: string } }) {
  const auth = await getRouteAccess()

  if (!auth) {
    return routeUnauthorizedResponse()
  }

  try {
    return NextResponse.json(
      await getLegacyOauthApplicationById(auth.accessToken, {
        slug: params.orgSlug,
        id: params.oauthApplicationId
      })
    )
  } catch (error) {
    return routeErrorResponse(error)
  }
}

export async function PUT(request: Request, { params }: { params: { orgSlug: string; oauthApplicationId: string } }) {
  const auth = await getRouteAccess()

  if (!auth) {
    return routeUnauthorizedResponse()
  }

  const body = await request.json()

  try {
    return NextResponse.json(
      await updateLegacyOauthApplication(auth.accessToken, {
        slug: params.orgSlug,
        id: params.oauthApplicationId,
        name: typeof body.name === 'string' ? body.name : undefined,
        redirectUri:
          typeof body.redirect_uri === 'string' || body.redirect_uri === null ? body.redirect_uri : undefined,
        avatarPath:
          typeof body.avatar_path === 'string' || body.avatar_path === null ? body.avatar_path : undefined,
        webhooks: Array.isArray(body.webhooks)
          ? body.webhooks.map((webhook: any) => ({
              id: typeof webhook?.id === 'string' ? webhook.id : undefined,
              url: typeof webhook?.url === 'string' ? webhook.url : '',
              event_types: Array.isArray(webhook?.event_types)
                ? webhook.event_types.filter((eventType: unknown) => typeof eventType === 'string')
                : undefined
            }))
          : undefined
      })
    )
  } catch (error) {
    return routeErrorResponse(error)
  }
}

export async function DELETE(_: Request, { params }: { params: { orgSlug: string; oauthApplicationId: string } }) {
  const auth = await getRouteAccess()

  if (!auth) {
    return routeUnauthorizedResponse()
  }

  try {
    return NextResponse.json(
      await deleteLegacyOauthApplication(auth.accessToken, {
        slug: params.orgSlug,
        id: params.oauthApplicationId
      })
    )
  } catch (error) {
    return routeErrorResponse(error)
  }
}
