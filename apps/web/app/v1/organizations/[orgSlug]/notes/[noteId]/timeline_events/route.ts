import { NextResponse } from 'next/server'

import { getLegacyNoteTimelineEventsPage } from '@/lib/convex/notes'
import { routeErrorResponse } from '@/lib/routeErrors'
import { getRouteAccess, routeUnauthorizedResponse } from '@/lib/routeSession'

interface Context {
  params: Promise<{ orgSlug: string; noteId: string }>
}

function parseLimit(value: string | null) {
  if (!value) {
    return undefined
  }

  const parsed = Number(value)

  return Number.isFinite(parsed) ? parsed : undefined
}

export async function GET(request: Request, context: Context) {
  const auth = await getRouteAccess()
  const { orgSlug, noteId } = await context.params

  if (!auth) {
    return routeUnauthorizedResponse()
  }

  const searchParams = new URL(request.url).searchParams

  try {
    return NextResponse.json(
      await getLegacyNoteTimelineEventsPage(auth.accessToken, {
        slug: orgSlug,
        noteId,
        after: searchParams.get('after') || undefined,
        limit: parseLimit(searchParams.get('limit'))
      })
    )
  } catch (error) {
    return routeErrorResponse(error)
  }
}
