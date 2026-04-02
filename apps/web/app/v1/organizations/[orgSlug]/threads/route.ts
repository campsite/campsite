import { NextResponse } from 'next/server'

import { createLegacyThread, getLegacyThreads } from '@/lib/convex/threads'
import { routeErrorResponse } from '@/lib/routeErrors'
import { getRouteAccess, routeUnauthorizedResponse } from '@/lib/routeSession'

interface Context {
  params: Promise<{ orgSlug: string }>
}

export async function GET(_: Request, context: Context) {
  const auth = await getRouteAccess()
  const { orgSlug } = await context.params

  if (!auth) {
    return routeUnauthorizedResponse()
  }

  try {
    return NextResponse.json(await getLegacyThreads(auth.accessToken, { slug: orgSlug }))
  } catch (error) {
    return routeErrorResponse(error)
  }
}

export async function POST(request: Request, context: Context) {
  const auth = await getRouteAccess()
  const { orgSlug } = await context.params

  if (!auth) {
    return routeUnauthorizedResponse()
  }

  const body = await request.json()

  try {
    return NextResponse.json(
      await createLegacyThread(auth.accessToken, {
        slug: orgSlug,
        group: typeof body.group === 'boolean' ? body.group : undefined,
        title: typeof body.title === 'string' ? body.title : undefined,
        memberIds: Array.isArray(body.member_ids) ? body.member_ids : undefined,
        oauthApplicationIds: Array.isArray(body.oauth_application_ids) ? body.oauth_application_ids : undefined,
        content: typeof body.content === 'string' ? body.content : undefined,
        attachments: Array.isArray(body.attachments) ? body.attachments : undefined
      })
    )
  } catch (error) {
    return routeErrorResponse(error)
  }
}
