import { NextResponse } from 'next/server'

import { getLegacyNotesPage } from '@/lib/convex/notes'
import { routeErrorResponse } from '@/lib/routeErrors'
import { getRouteAccess, routeUnauthorizedResponse } from '@/lib/routeSession'

interface Context {
  params: Promise<{ orgSlug: string; projectId: string }>
}

function parseOrder(
  searchParams: URLSearchParams
): { by: 'created_at' | 'last_activity_at'; direction: 'asc' | 'desc' } | undefined {
  const by = searchParams.get('order[by]')
  const direction = searchParams.get('order[direction]')

  if ((by !== 'created_at' && by !== 'last_activity_at') || (direction !== 'asc' && direction !== 'desc')) {
    return undefined
  }

  return { by, direction }
}

export async function GET(request: Request, context: Context) {
  const auth = await getRouteAccess()
  const { orgSlug, projectId } = await context.params

  if (!auth) {
    return routeUnauthorizedResponse()
  }

  const searchParams = new URL(request.url).searchParams
  const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined

  try {
    return NextResponse.json(
      await getLegacyNotesPage(auth.accessToken, {
        slug: orgSlug,
        projectId,
        after: searchParams.get('after') || undefined,
        limit: Number.isFinite(limit) ? limit : undefined,
        q: searchParams.get('q') || undefined,
        order: parseOrder(searchParams)
      })
    )
  } catch (error) {
    return routeErrorResponse(error)
  }
}
