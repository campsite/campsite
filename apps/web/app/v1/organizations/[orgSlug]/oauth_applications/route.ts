import { NextResponse } from 'next/server'

import { createLegacyOauthApplication, getLegacyOauthApplications } from '@/lib/convex/collaboration'
import { routeErrorResponse } from '@/lib/routeErrors'
import { getRouteAccess, routeUnauthorizedResponse } from '@/lib/routeSession'

export async function GET(_: Request, { params }: { params: { orgSlug: string } }) {
  const auth = await getRouteAccess()

  if (!auth) {
    return routeUnauthorizedResponse()
  }

  try {
    return NextResponse.json(
      await getLegacyOauthApplications(auth.accessToken, {
        slug: params.orgSlug
      })
    )
  } catch (error) {
    return routeErrorResponse(error)
  }
}

export async function POST(request: Request, { params }: { params: { orgSlug: string } }) {
  const auth = await getRouteAccess()

  if (!auth) {
    return routeUnauthorizedResponse()
  }

  const body = await request.json()

  try {
    return NextResponse.json(
      await createLegacyOauthApplication(auth.accessToken, {
        slug: params.orgSlug,
        name: typeof body.name === 'string' ? body.name : '',
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
      }),
      { status: 201 }
    )
  } catch (error) {
    return routeErrorResponse(error)
  }
}
