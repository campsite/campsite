import { NextResponse } from 'next/server'

import { completeSlackIntegrationCallback } from '@/lib/convex/externalPlatforms'
import { getRouteAccess } from '@/lib/routeSession'

interface Context {
  params: Promise<{ orgSlug: string }>
}

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: Request, context: Context) {
  const auth = await getRouteAccess()
  const { orgSlug } = await context.params
  const requestUrl = new URL(request.url)
  const successPath = requestUrl.searchParams.get('campsite_success_path') || `/${orgSlug}/settings/integrations`
  const enableNotifications = requestUrl.searchParams.get('enable_notifications') === 'true'

  if (auth) {
    await completeSlackIntegrationCallback(auth.accessToken, { slug: orgSlug, enableNotifications })
  }

  return NextResponse.redirect(new URL(successPath, requestUrl))
}
