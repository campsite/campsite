import { NextResponse } from 'next/server'

import { getLegacyOrganizationMemberships } from '@/lib/convex/server'
import { completeLinearIntegrationCallback } from '@/lib/convex/externalPlatforms'
import { getRouteAccess } from '@/lib/routeSession'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: Request) {
  const auth = await getRouteAccess()
  const requestUrl = new URL(request.url)
  const successPath = requestUrl.searchParams.get('campsite_success_path') || '/linear-connection-success'
  const state = requestUrl.searchParams.get('state')

  if (auth && state) {
    const memberships = await getLegacyOrganizationMemberships(auth.accessToken)
    const organization = memberships.find((membership: any) => membership.organization?.id === state)?.organization

    if (organization?.slug) {
      await completeLinearIntegrationCallback(auth.accessToken, { slug: organization.slug })
    }
  }

  return NextResponse.redirect(new URL(successPath, requestUrl))
}
