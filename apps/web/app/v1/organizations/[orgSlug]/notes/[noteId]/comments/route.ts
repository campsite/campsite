import { NextResponse } from 'next/server'

import { createLegacyNoteComment, getLegacyNoteCommentsPage } from '@/lib/convex/notes'
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
      await getLegacyNoteCommentsPage(auth.accessToken, {
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

export async function POST(request: Request, context: Context) {
  const auth = await getRouteAccess()
  const { orgSlug, noteId } = await context.params

  if (!auth) {
    return routeUnauthorizedResponse()
  }

  const body = await request.json()

  try {
    return NextResponse.json(
      await createLegacyNoteComment(auth.accessToken, {
        slug: orgSlug,
        noteId,
        attachment_ids: Array.isArray(body.attachment_ids) ? body.attachment_ids : undefined,
        attachments: Array.isArray(body.attachments) ? body.attachments : undefined,
        body_html: typeof body.body_html === 'string' || body.body_html === null ? body.body_html : undefined,
        file_id: typeof body.file_id === 'string' || body.file_id === null ? body.file_id : undefined,
        note_highlight:
          typeof body.note_highlight === 'string' || body.note_highlight === null ? body.note_highlight : undefined,
        parent_comment_id:
          typeof body.parent_comment_id === 'string' || body.parent_comment_id === null
            ? body.parent_comment_id
            : undefined,
        timestamp: typeof body.timestamp === 'number' || body.timestamp === null ? body.timestamp : undefined,
        x: typeof body.x === 'number' || body.x === null ? body.x : undefined,
        y: typeof body.y === 'number' || body.y === null ? body.y : undefined
      })
    )
  } catch (error) {
    return routeErrorResponse(error)
  }
}
