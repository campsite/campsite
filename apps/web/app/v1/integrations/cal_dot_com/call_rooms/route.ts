import { NextResponse } from 'next/server'

import { createLegacyCallRoom } from '@/lib/convex/callRooms'
import { getLegacyCalDotComIntegration } from '@/lib/convex/externalPlatforms'
import { getLegacyOrganizationMemberships } from '@/lib/convex/server'
import { routeErrorResponse } from '@/lib/routeErrors'
import { getRouteAccess, routeUnauthorizedResponse } from '@/lib/routeSession'

export async function POST() {
  const auth = await getRouteAccess()

  if (!auth) {
    return routeUnauthorizedResponse()
  }

  try {
    const [calDotCom, memberships] = await Promise.all([
      getLegacyCalDotComIntegration(auth.accessToken),
      getLegacyOrganizationMemberships(auth.accessToken)
    ])
    const targetOrgId = calDotCom.organization?.id || memberships[0]?.organization?.id
    const targetOrg = memberships.find((membership: any) => membership.organization?.id === targetOrgId)?.organization

    if (!targetOrg?.slug) {
      throw new Error('not_found:Organization not found')
    }

    return NextResponse.json(
      await createLegacyCallRoom(auth.accessToken, {
        slug: targetOrg.slug,
        source: 'cal_dot_com'
      })
    )
  } catch (error) {
    return routeErrorResponse(error)
  }
}
