import { NextResponse } from 'next/server'

import { getLegacyTagPostsPage } from '@/lib/convex/tags'
import { routeErrorResponse } from '@/lib/routeErrors'
import { getRouteAccess, routeUnauthorizedResponse } from '@/lib/routeSession'

interface Context {
  params: Promise<{ orgSlug: string; tagName: string }>
}

export async function GET(request: Request, context: Context) {
  const auth = await getRouteAccess()
  const { orgSlug, tagName } = await context.params

  if (!auth) {
    return routeUnauthorizedResponse()
  }

  const searchParams = new URL(request.url).searchParams

  try {
    return NextResponse.json(
      await getLegacyTagPostsPage(auth.accessToken, {
        slug: orgSlug,
        tagName,
        after: searchParams.get('after') || undefined,
        limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined
      })
    )
  } catch (error) {
    return routeErrorResponse(error)
  }
}
