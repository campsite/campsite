import { NextResponse } from 'next/server'

import { createProjectPin } from '@/lib/convex/pinsBookmarks'
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
      await createProjectPin(auth.accessToken, {
        slug: orgSlug,
        subjectType: 'Post',
        subjectId: postId
      }),
      { status: 201 }
    )
  } catch (error) {
    return routeErrorResponse(error)
  }
}
