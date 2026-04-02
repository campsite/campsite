import { NextResponse } from 'next/server'

import { getLegacySearchPosts } from '@/lib/convex/search'
import { routeErrorResponse } from '@/lib/routeErrors'
import { getRouteAccess, routeUnauthorizedResponse } from '@/lib/routeSession'

interface Context {
  params: Promise<{ orgSlug: string }>
}

function parseLimit(value: string | null) {
  if (!value) {
    return undefined
  }

  const limit = Number(value)

  return Number.isFinite(limit) ? limit : undefined
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
      await getLegacySearchPosts(auth.accessToken, {
        slug: orgSlug,
        q: searchParams.get('q') || '',
        project_id: searchParams.get('project_id') || undefined,
        author: searchParams.get('author') || undefined,
        tag: searchParams.get('tag') || undefined,
        limit: parseLimit(searchParams.get('limit'))
      })
    )
  } catch (error) {
    return routeErrorResponse(error)
  }
}
