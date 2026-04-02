import { NextResponse } from 'next/server'

import { updateLegacyNoteVisibility } from '@/lib/convex/notes'
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
      await updateLegacyNoteVisibility(auth.accessToken, {
        slug: orgSlug,
        noteId,
        visibility: body.visibility === 'public' ? 'public' : 'default'
      })
    )
  } catch (error) {
    return routeErrorResponse(error)
  }
}
