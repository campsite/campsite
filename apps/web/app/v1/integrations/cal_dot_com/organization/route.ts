import { NextResponse } from 'next/server'

import { updateLegacyCalDotComOrganization } from '@/lib/convex/externalPlatforms'
import { routeErrorResponse } from '@/lib/routeErrors'
import { getRouteAccess, routeUnauthorizedResponse } from '@/lib/routeSession'

export async function PUT(request: Request) {
  const auth = await getRouteAccess()

  if (!auth) {
    return routeUnauthorizedResponse()
  }

  const body = (await request.json().catch(() => null)) as { organization_id?: string } | null

  try {
    return NextResponse.json(
      await updateLegacyCalDotComOrganization(auth.accessToken, {
        organizationId: body?.organization_id || ''
      })
    )
  } catch (error) {
    return routeErrorResponse(error)
  }
}
