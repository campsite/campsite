import { NextResponse } from 'next/server'

import { getLegacyOrganization } from '@/lib/convex/server'
import { getRouteAccess, routeUnauthorizedResponse } from '@/lib/routeSession'

interface Context {
  params: Promise<{ orgSlug: string }>
}

export async function GET(_: Request, context: Context) {
  const auth = await getRouteAccess()
  const { orgSlug } = await context.params

  if (!auth) {
    return routeUnauthorizedResponse()
  }

  const organization = await getLegacyOrganization(auth.accessToken, orgSlug)

  if (!organization) {
    return NextResponse.json({ code: 'not_found', message: 'Organization not found' }, { status: 404 })
  }

  return NextResponse.json({
    features: organization.features ?? []
  })
}
