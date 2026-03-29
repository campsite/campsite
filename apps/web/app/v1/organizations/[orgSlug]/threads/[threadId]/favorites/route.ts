import { NextResponse } from 'next/server'

import { createLegacyFavorite, deleteLegacyFavoriteByFavoritable } from '@/lib/convex/engagement'
import { routeErrorResponse } from '@/lib/routeErrors'
import { getRouteAccess, routeUnauthorizedResponse } from '@/lib/routeSession'

interface Context {
  params: Promise<{ orgSlug: string; threadId: string }>
}

export async function POST(_: Request, context: Context) {
  const auth = await getRouteAccess()
  const { orgSlug, threadId } = await context.params

  if (!auth) {
    return routeUnauthorizedResponse()
  }

  try {
    return NextResponse.json(
      await createLegacyFavorite(auth.accessToken, {
        slug: orgSlug,
        favoritableType: 'MessageThread',
        favoritableId: threadId
      })
    )
  } catch (error) {
    return routeErrorResponse(error)
  }
}

export async function DELETE(_: Request, context: Context) {
  const auth = await getRouteAccess()
  const { orgSlug, threadId } = await context.params

  if (!auth) {
    return routeUnauthorizedResponse()
  }

  try {
    return NextResponse.json(
      await deleteLegacyFavoriteByFavoritable(auth.accessToken, {
        slug: orgSlug,
        favoritableType: 'MessageThread',
        favoritableId: threadId
      })
    )
  } catch (error) {
    return routeErrorResponse(error)
  }
}
