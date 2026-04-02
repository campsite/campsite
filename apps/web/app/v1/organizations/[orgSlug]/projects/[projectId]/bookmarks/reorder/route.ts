import { NextResponse } from 'next/server'

import { reorderProjectBookmarks } from '@/lib/convex/pinsBookmarks'
import { routeErrorResponse } from '@/lib/routeErrors'
import { getRouteAccess, routeUnauthorizedResponse } from '@/lib/routeSession'

interface Context {
  params: Promise<{ orgSlug: string; projectId: string }>
}

export async function PUT(request: Request, context: Context) {
  const auth = await getRouteAccess()
  const { orgSlug, projectId } = await context.params

  if (!auth) {
    return routeUnauthorizedResponse()
  }

  const body = await request.json()

  try {
    return NextResponse.json(
      await reorderProjectBookmarks(auth.accessToken, {
        slug: orgSlug,
        projectId,
        bookmarks: Array.isArray(body.bookmarks)
          ? body.bookmarks
              .filter((bookmark: unknown) => typeof bookmark === 'object' && bookmark !== null)
              .map((bookmark: any) => ({
                id: typeof bookmark.id === 'string' ? bookmark.id : '',
                position: typeof bookmark.position === 'number' ? bookmark.position : 0
              }))
          : []
      })
    )
  } catch (error) {
    return routeErrorResponse(error)
  }
}
