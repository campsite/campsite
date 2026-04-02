import { NextResponse } from 'next/server'

import { updateLegacyPostVisibility } from '@/lib/convex/server'
import { routeErrorResponse } from '@/lib/routeErrors'
import { getRouteAccess, routeUnauthorizedResponse } from '@/lib/routeSession'

interface Context {
  params: Promise<{ orgSlug: string; postId: string }>
}

export async function PUT(request: Request, context: Context) {
  const auth = await getRouteAccess()
  const { orgSlug, postId } = await context.params

  if (!auth) {
    return routeUnauthorizedResponse()
  }

  const body = await request.json().catch(() => null)

  try {
    return NextResponse.json(
      await updateLegacyPostVisibility(auth.accessToken, {
        slug: orgSlug,
        postId,
        visibility: body?.visibility === 'public' ? 'public' : 'default'
      })
    )
  } catch (error) {
    return routeErrorResponse(error)
  }
}
