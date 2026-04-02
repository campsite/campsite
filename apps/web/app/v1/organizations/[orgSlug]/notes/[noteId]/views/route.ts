import { withAuth } from '@workos-inc/authkit-nextjs'
import { NextResponse } from 'next/server'

import { createLegacyNoteView, getLegacyNoteViews } from '@/lib/convex/notes'
import { ensureWorkspace } from '@/lib/convex/server'
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
      await getLegacyNoteViews(auth.accessToken, {
        slug: orgSlug,
        noteId
      })
    )
  } catch (error) {
    return routeErrorResponse(error)
  }
}

export async function POST(request: Request, context: Context) {
  const { accessToken, user } = await withAuth()
  const { orgSlug, noteId } = await context.params

  if (accessToken && user) {
    await ensureWorkspace(accessToken, user)
  }

  try {
    return NextResponse.json(
      await createLegacyNoteView(accessToken, {
        slug: orgSlug,
        noteId,
        anonymized_ip: request.headers.get('x-forwarded-for') ?? undefined,
        user_agent: request.headers.get('user-agent') ?? undefined
      })
    )
  } catch (error) {
    return routeErrorResponse(error)
  }
}
