import { NextResponse } from 'next/server'

import { reorderLegacyFavorites } from '@/lib/convex/engagement'
import { routeErrorResponse } from '@/lib/routeErrors'
import { getRouteAccess, routeUnauthorizedResponse } from '@/lib/routeSession'

interface Context {
  params: Promise<{ orgSlug: string }>
}

export async function PUT(request: Request, context: Context) {
  const auth = await getRouteAccess()
  const { orgSlug } = await context.params

  if (!auth) {
    return routeUnauthorizedResponse()
  }

  const body = await request.json()

  try {
    return NextResponse.json(
      await reorderLegacyFavorites(auth.accessToken, {
        slug: orgSlug,
        favorites: Array.isArray(body.favorites)
          ? body.favorites
              .filter((favorite: unknown) => {
                return typeof favorite === 'object' && favorite !== null
              })
              .map((favorite: any) => ({
                id: typeof favorite.id === 'string' ? favorite.id : '',
                position: typeof favorite.position === 'number' ? favorite.position : 0
              }))
          : []
      })
    )
  } catch (error) {
    return routeErrorResponse(error)
  }
}
