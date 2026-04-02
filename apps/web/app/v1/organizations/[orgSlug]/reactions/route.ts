import { NextResponse } from 'next/server'

import { deleteLegacyReaction } from '@/lib/convex/engagement'
import { routeErrorResponse } from '@/lib/routeErrors'
import { getRouteAccess, routeUnauthorizedResponse } from '@/lib/routeSession'

interface Context {
  params: Promise<{ orgSlug: string }>
}

export async function DELETE(request: Request, context: Context) {
  const auth = await getRouteAccess()
  const { orgSlug } = await context.params

  if (!auth) {
    return routeUnauthorizedResponse()
  }

  const body = await request.json().catch(() => ({}))

  try {
    return NextResponse.json(
      await deleteLegacyReaction(auth.accessToken, {
        slug: orgSlug,
        reactionId: typeof body.id === 'string' ? body.id : ''
      })
    )
  } catch (error) {
    return routeErrorResponse(error)
  }
}
