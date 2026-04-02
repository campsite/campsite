import { NextResponse } from 'next/server'

import { createLegacySubscription } from '@/lib/convex/engagement'
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
      await createLegacySubscription(auth.accessToken, {
        slug: orgSlug,
        subscribableType: 'Post',
        subscribableId: postId
      })
    )
  } catch (error) {
    return routeErrorResponse(error)
  }
}
