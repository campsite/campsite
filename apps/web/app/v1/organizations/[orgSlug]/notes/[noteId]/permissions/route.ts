import { NextResponse } from 'next/server'

import { createLegacyNotePermissions, getLegacyNotePermissions } from '@/lib/convex/notes'
import { routeErrorResponse } from '@/lib/routeErrors'
import { getRouteAccess, routeUnauthorizedResponse } from '@/lib/routeSession'

interface Context {
  params: Promise<{ orgSlug: string; noteId: string }>
}

export async function GET(_: Request, context: Context) {
  const auth = await getRouteAccess()
  const { orgSlug, noteId } = await context.params

  if (!auth) {
    return routeUnauthorizedResponse()
  }

  try {
    return NextResponse.json(
      await getLegacyNotePermissions(auth.accessToken, {
        slug: orgSlug,
        noteId
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
      await createLegacyNotePermissions(auth.accessToken, {
        slug: orgSlug,
        noteId,
        member_ids: Array.isArray(body.member_ids) ? body.member_ids : [],
        permission: body.permission === 'edit' ? 'edit' : 'view'
      })
    )
  } catch (error) {
    return routeErrorResponse(error)
  }
}
