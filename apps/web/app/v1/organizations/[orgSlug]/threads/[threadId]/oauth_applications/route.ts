import { NextResponse } from 'next/server'

import { OauthApplication } from '@campsite/types/generated'

import {
  getLegacyOauthApplications,
  getLegacyOauthApplicationById
} from '@/lib/convex/collaboration'
import { createLegacyThreadOauthApplication, getLegacyThreadOauthApplications } from '@/lib/convex/threads'
import { routeErrorResponse } from '@/lib/routeErrors'
import { getRouteAccess, routeUnauthorizedResponse } from '@/lib/routeSession'

export async function GET(_: Request, { params }: { params: { orgSlug: string; threadId: string } }) {
  const auth = await getRouteAccess()

  if (!auth) {
    return routeUnauthorizedResponse()
  }

  try {
    const [threadOauthApps, orgOauthApps] = (await Promise.all([
      getLegacyThreadOauthApplications(auth.accessToken, {
        slug: params.orgSlug,
        threadId: params.threadId
      }),
      getLegacyOauthApplications(auth.accessToken, {
        slug: params.orgSlug
      })
    ])) as [OauthApplication[], OauthApplication[]]

    const orgOauthAppsById = new Map(orgOauthApps.map((app) => [app.id, app]))

    return NextResponse.json(threadOauthApps.map((app) => orgOauthAppsById.get(app.id) ?? app))
  } catch (error) {
    return routeErrorResponse(error)
  }
}

export async function POST(request: Request, { params }: { params: { orgSlug: string; threadId: string } }) {
  const auth = await getRouteAccess()

  if (!auth) {
    return routeUnauthorizedResponse()
  }

  const body = await request.json()

  try {
    const oauthApplicationId = typeof body.oauth_application_id === 'string' ? body.oauth_application_id : ''

    await getLegacyOauthApplicationById(auth.accessToken, {
      slug: params.orgSlug,
      id: oauthApplicationId
    })

    return NextResponse.json(
      await createLegacyThreadOauthApplication(auth.accessToken, {
        slug: params.orgSlug,
        threadId: params.threadId,
        oauthApplicationId
      })
    )
  } catch (error) {
    return routeErrorResponse(error)
  }
}
