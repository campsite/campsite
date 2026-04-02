import { NextResponse } from 'next/server'

import { createLegacySubscription, deleteLegacySubscription } from '@/lib/convex/engagement'
import { routeErrorResponse } from '@/lib/routeErrors'
import { getRouteAccess, routeUnauthorizedResponse } from '@/lib/routeSession'

interface Context {
  params: Promise<{ orgSlug: string; projectId: string }>
}

export async function POST(request: Request, context: Context) {
  const auth = await getRouteAccess()
  const { orgSlug, projectId } = await context.params

  if (!auth) {
    return routeUnauthorizedResponse()
  }

  const body = await request.json().catch(() => ({}))

  try {
    return NextResponse.json(
      await createLegacySubscription(auth.accessToken, {
        slug: orgSlug,
        subscribableType: 'Project',
        subscribableId: projectId,
        cascade: body.cascade === true
      })
    )
  } catch (error) {
    return routeErrorResponse(error)
  }
}

export async function DELETE(_: Request, context: Context) {
  const auth = await getRouteAccess()
  const { orgSlug, projectId } = await context.params

  if (!auth) {
    return routeUnauthorizedResponse()
  }

  try {
    return NextResponse.json(
      await deleteLegacySubscription(auth.accessToken, {
        slug: orgSlug,
        subscribableType: 'Project',
        subscribableId: projectId
      })
    )
  } catch (error) {
    return routeErrorResponse(error)
  }
}
