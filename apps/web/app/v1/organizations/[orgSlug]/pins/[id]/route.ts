import { NextResponse } from 'next/server'

import { deleteProjectPin } from '@/lib/convex/pinsBookmarks'
import { routeErrorResponse } from '@/lib/routeErrors'
import { getRouteAccess, routeUnauthorizedResponse } from '@/lib/routeSession'

interface Context {
  params: Promise<{ orgSlug: string; id: string }>
}

export async function DELETE(_: Request, context: Context) {
  const auth = await getRouteAccess()
  const { orgSlug, id } = await context.params

  if (!auth) {
    return routeUnauthorizedResponse()
  }

  try {
    await deleteProjectPin(auth.accessToken, {
      slug: orgSlug,
      pinId: id
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    return routeErrorResponse(error)
  }
}
