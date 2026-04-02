import { NextResponse } from 'next/server'

import { deleteLegacyNotePermission, updateLegacyNotePermission } from '@/lib/convex/notes'
import { routeErrorResponse } from '@/lib/routeErrors'
import { getRouteAccess, routeUnauthorizedResponse } from '@/lib/routeSession'

interface Context {
  params: Promise<{ orgSlug: string; noteId: string; permissionId: string }>
}

export async function PUT(request: Request, context: Context) {
  const auth = await getRouteAccess()
  const { orgSlug, noteId, permissionId } = await context.params

  if (!auth) {
    return routeUnauthorizedResponse()
  }

  const body = await request.json()

  try {
    return NextResponse.json(
      await updateLegacyNotePermission(auth.accessToken, {
        slug: orgSlug,
        noteId,
        permissionId,
        permission: body.permission === 'edit' ? 'edit' : 'view'
      })
    )
  } catch (error) {
    return routeErrorResponse(error)
  }
}

export async function DELETE(_: Request, context: Context) {
  const auth = await getRouteAccess()
  const { orgSlug, noteId, permissionId } = await context.params

  if (!auth) {
    return routeUnauthorizedResponse()
  }

  try {
    return NextResponse.json(
      await deleteLegacyNotePermission(auth.accessToken, {
        slug: orgSlug,
        noteId,
        permissionId
      })
    )
  } catch (error) {
    return routeErrorResponse(error)
  }
}
