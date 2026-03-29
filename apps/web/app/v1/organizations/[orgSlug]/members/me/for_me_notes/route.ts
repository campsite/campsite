import { NextResponse } from 'next/server'

import { getLegacyNotesPage, promoteLegacyNotesCompat } from '@/lib/convex/notes'
import { routeErrorResponse } from '@/lib/routeErrors'
import { getRouteAccess, routeUnauthorizedResponse } from '@/lib/routeSession'

interface Context {
  params: Promise<{ orgSlug: string }>
}

function parseLimit(value: string | null) {
  if (!value) {
    return undefined
  }

  const parsed = Number(value)

  return Number.isFinite(parsed) ? parsed : undefined
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
  const { orgSlug } = await context.params

  if (!auth) {
    return routeUnauthorizedResponse()
  }

  const searchParams = new URL(request.url).searchParams

  try {
    await promoteLegacyNotesCompat(auth.accessToken, { slug: orgSlug })

    return NextResponse.json(
      await getLegacyNotesPage(auth.accessToken, {
        slug: orgSlug,
        after: searchParams.get('after') || undefined,
        limit: parseLimit(searchParams.get('limit')),
        q: searchParams.get('q') || undefined,
        order: parseOrder(searchParams),
        mode: 'for_me'
      })
    )
  } catch (error) {
    return routeErrorResponse(error)
  }
}
