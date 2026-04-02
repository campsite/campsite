import { NextResponse } from 'next/server'

import { deleteLegacyNoteProjectPermission, updateLegacyNoteProjectPermission } from '@/lib/convex/notes'
import { routeErrorResponse } from '@/lib/routeErrors'
import { getRouteAccess, routeUnauthorizedResponse } from '@/lib/routeSession'

interface Context {
  params: Promise<{ orgSlug: string; noteId: string }>
}

export async function PUT(request: Request, context: Context) {
  const auth = await getRouteAccess()
  const { orgSlug, noteId } = await context.params

  if (!auth) {
    return routeUnauthorizedResponse()
  }

  const body = await request.json()

  try {
    return NextResponse.json(
      await updateLegacyNoteProjectPermission(auth.accessToken, {
        slug: orgSlug,
        noteId,
        project_id: typeof body.project_id === 'string' ? body.project_id : '',
        permission: body.permission === 'edit' ? 'edit' : 'view'
      })
    )
  } catch (error) {
    return routeErrorResponse(error)
  }
}

export async function DELETE(_: Request, context: Context) {
  const auth = await getRouteAccess()
  const { orgSlug, noteId } = await context.params

  if (!auth) {
    return routeUnauthorizedResponse()
  }

  try {
    return NextResponse.json(
      await deleteLegacyNoteProjectPermission(auth.accessToken, {
        slug: orgSlug,
        noteId
      })
    )
  } catch (error) {
    return routeErrorResponse(error)
  }
}
