import { NextResponse } from 'next/server'

import { getLegacyFollowUpsPage } from '@/lib/convex/engagement'
import { routeErrorResponse } from '@/lib/routeErrors'
import { getRouteAccess, routeUnauthorizedResponse } from '@/lib/routeSession'

interface Context {
  params: Promise<{ orgSlug: string }>
}

export async function GET(request: Request, context: Context) {
  const auth = await getRouteAccess()
  const { orgSlug } = await context.params

  if (!auth) {
    return routeUnauthorizedResponse()
  }

  const searchParams = new URL(request.url).searchParams

  try {
    return NextResponse.json(
      await getLegacyFollowUpsPage(auth.accessToken, {
        slug: orgSlug,
        after: searchParams.get('after') ?? undefined,
        limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined
      })
    )
  } catch (error) {
    return routeErrorResponse(error)
  }
}
