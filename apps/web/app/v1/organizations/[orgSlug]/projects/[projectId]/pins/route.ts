import { NextResponse } from 'next/server'

import { getProjectPins } from '@/lib/convex/pinsBookmarks'
import { routeErrorResponse } from '@/lib/routeErrors'
import { getRouteAccess, routeUnauthorizedResponse } from '@/lib/routeSession'

interface Context {
  params: Promise<{ orgSlug: string; projectId: string }>
}

export async function GET(_: Request, context: Context) {
  const auth = await getRouteAccess()
  const { orgSlug, projectId } = await context.params

  if (!auth) {
    return routeUnauthorizedResponse()
  }

  try {
    return NextResponse.json(
      await getProjectPins(auth.accessToken, {
        slug: orgSlug,
        projectId
      })
    )
  } catch (error) {
    return routeErrorResponse(error)
  }
}
