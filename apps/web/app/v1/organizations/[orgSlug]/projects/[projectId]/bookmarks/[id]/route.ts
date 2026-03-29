import { NextResponse } from 'next/server'

import { deleteProjectBookmark, updateProjectBookmark } from '@/lib/convex/pinsBookmarks'
import { routeErrorResponse } from '@/lib/routeErrors'
import { getRouteAccess, routeUnauthorizedResponse } from '@/lib/routeSession'

interface Context {
  params: Promise<{ orgSlug: string; projectId: string; id: string }>
}

export async function PATCH(request: Request, context: Context) {
  const auth = await getRouteAccess()
  const { orgSlug, projectId, id } = await context.params

  if (!auth) {
    return routeUnauthorizedResponse()
  }

  const body = await request.json()

  try {
    return NextResponse.json(
      await updateProjectBookmark(auth.accessToken, {
        slug: orgSlug,
        projectId,
        bookmarkId: id,
        title: typeof body.title === 'string' ? body.title : '',
        url: typeof body.url === 'string' ? body.url : ''
      })
    )
  } catch (error) {
    return routeErrorResponse(error)
  }
}

export async function DELETE(_: Request, context: Context) {
  const auth = await getRouteAccess()
  const { orgSlug, projectId, id } = await context.params

  if (!auth) {
    return routeUnauthorizedResponse()
  }

  try {
    await deleteProjectBookmark(auth.accessToken, {
      slug: orgSlug,
      projectId,
      bookmarkId: id
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    return routeErrorResponse(error)
  }
}
