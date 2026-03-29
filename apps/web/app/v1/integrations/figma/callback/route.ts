import { NextResponse } from 'next/server'

import { completeFigmaIntegrationCallback } from '@/lib/convex/externalPlatforms'
import { getRouteAccess } from '@/lib/routeSession'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: Request) {
  const auth = await getRouteAccess()
  const requestUrl = new URL(request.url)
  const successPath = requestUrl.searchParams.get('campsite_success_path') || '/figma-connection-success'

  if (auth) {
    await completeFigmaIntegrationCallback(auth.accessToken)
  }

  return NextResponse.redirect(new URL(successPath, requestUrl))
}
