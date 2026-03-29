import { NextResponse } from 'next/server'

import { getLegacySyncCustomReactions } from '@/lib/convex/collaboration'
import { routeErrorResponse } from '@/lib/routeErrors'
import { getRouteAccess, routeUnauthorizedResponse } from '@/lib/routeSession'

export async function GET(_: Request, { params }: { params: { orgSlug: string } }) {
  const auth = await getRouteAccess()

  if (!auth) {
    return routeUnauthorizedResponse()
  }

  try {
    return NextResponse.json(
      await getLegacySyncCustomReactions(auth.accessToken, {
        slug: params.orgSlug
      })
    )
  } catch (error) {
    return routeErrorResponse(error)
  }
}
