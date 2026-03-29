import { NextResponse } from 'next/server'

import { createLegacyNote, getLegacyNotesPage, promoteLegacyNotesCompat } from '@/lib/convex/notes'
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
        order: parseOrder(searchParams)
      })
    )
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
      await createLegacyNote(auth.accessToken, {
        slug: orgSlug,
        title: typeof body.title === 'string' ? body.title : undefined,
        description_html: typeof body.description_html === 'string' ? body.description_html : undefined,
        project_id: typeof body.project_id === 'string' ? body.project_id : undefined
      })
    )
  } catch (error) {
    return routeErrorResponse(error)
  }
}
