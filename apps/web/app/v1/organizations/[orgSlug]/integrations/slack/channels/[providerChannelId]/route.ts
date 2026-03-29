import { NextResponse } from 'next/server'

import { getLegacySlackChannelByProviderId } from '@/lib/convex/externalPlatforms'
import { routeErrorResponse } from '@/lib/routeErrors'
import { getRouteAccess, routeUnauthorizedResponse } from '@/lib/routeSession'

interface Context {
  params: Promise<{ orgSlug: string; providerChannelId: string }>
}

export async function GET(_request: Request, context: Context) {
  const auth = await getRouteAccess()
  const { orgSlug, providerChannelId } = await context.params

  if (!auth) {
    return routeUnauthorizedResponse()
  }

  try {
    return NextResponse.json(
      await getLegacySlackChannelByProviderId(auth.accessToken, {
        slug: orgSlug,
        providerChannelId
      })
    )
  } catch (error) {
    return routeErrorResponse(error)
  }
}
