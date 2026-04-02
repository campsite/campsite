import { NextResponse } from 'next/server'

import { deleteLegacyFavorite } from '@/lib/convex/engagement'
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
    return NextResponse.json(await deleteLegacyFavorite(auth.accessToken, { slug: orgSlug, favoriteId: id }))
  } catch (error) {
    return routeErrorResponse(error)
  }
}
