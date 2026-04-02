import { NextResponse } from 'next/server'

import { getLegacyGeneratedPostResolution } from '@/lib/convex/server'
import { routeErrorResponse } from '@/lib/routeErrors'
import { getRouteAccess, routeUnauthorizedResponse } from '@/lib/routeSession'

interface Context {
  params: Promise<{ orgSlug: string; postId: string }>
}

export async function GET(request: Request, context: Context) {
  const auth = await getRouteAccess()
  const { orgSlug, postId } = await context.params

  if (!auth) {
    return routeUnauthorizedResponse()
  }

  const { searchParams } = new URL(request.url)
  const commentId = searchParams.get('comment_id')

  try {
    return NextResponse.json(
      await getLegacyGeneratedPostResolution(auth.accessToken, {
        slug: orgSlug,
        postId,
        commentId: commentId || undefined
      })
    )
  } catch (error) {
    return routeErrorResponse(error)
  }
}
