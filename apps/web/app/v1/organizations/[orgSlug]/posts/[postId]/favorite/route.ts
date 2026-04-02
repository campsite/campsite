import { NextResponse } from 'next/server'

import { createLegacyFavorite, deleteLegacyFavoriteByFavoritable } from '@/lib/convex/engagement'
import { routeErrorResponse } from '@/lib/routeErrors'
import { getRouteAccess, routeUnauthorizedResponse } from '@/lib/routeSession'

interface Context {
  params: Promise<{ orgSlug: string; postId: string }>
}

export async function POST(_: Request, context: Context) {
  const auth = await getRouteAccess()
  const { orgSlug, postId } = await context.params

  if (!auth) {
    return routeUnauthorizedResponse()
  }

  try {
    return NextResponse.json(
      await createLegacyFavorite(auth.accessToken, {
        slug: orgSlug,
        favoritableType: 'Post',
        favoritableId: postId
      })
    )
  } catch (error) {
    return routeErrorResponse(error)
  }
}

export async function DELETE(_: Request, context: Context) {
  const auth = await getRouteAccess()
  const { orgSlug, postId } = await context.params

  if (!auth) {
    return routeUnauthorizedResponse()
  }

  try {
    return NextResponse.json(
      await deleteLegacyFavoriteByFavoritable(auth.accessToken, {
        slug: orgSlug,
        favoritableType: 'Post',
        favoritableId: postId
      })
    )
  } catch (error) {
    return routeErrorResponse(error)
  }
}
