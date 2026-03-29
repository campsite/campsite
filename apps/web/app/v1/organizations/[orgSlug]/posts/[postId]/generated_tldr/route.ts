import { NextResponse } from 'next/server'

import { getLegacyGeneratedPostTldr } from '@/lib/convex/server'
import { routeErrorResponse } from '@/lib/routeErrors'
import { getRouteAccess, routeUnauthorizedResponse } from '@/lib/routeSession'

interface Context {
  params: Promise<{ orgSlug: string; postId: string }>
}

export async function GET(_: Request, context: Context) {
  const auth = await getRouteAccess()
  const { orgSlug, postId } = await context.params

  if (!auth) {
    return routeUnauthorizedResponse()
  }

  try {
    return NextResponse.json(
      await getLegacyGeneratedPostTldr(auth.accessToken, {
        slug: orgSlug,
        postId
      })
    )
  } catch (error) {
    return routeErrorResponse(error)
  }
}
