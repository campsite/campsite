import { NextResponse } from 'next/server'

import { getLegacyResourceMentionByUrl } from '@/lib/convex/search'
import { routeErrorResponse } from '@/lib/routeErrors'
import { getRouteAccess, routeUnauthorizedResponse } from '@/lib/routeSession'

interface Context {
  params: Promise<{ orgSlug: string }>
}

export async function GET(request: Request, context: Context) {
  const auth = await getRouteAccess()
  const { orgSlug } = await context.params

  if (!auth) {
    return routeUnauthorizedResponse()
  }

  const searchParams = new URL(request.url).searchParams

  try {
    return NextResponse.json(
      await getLegacyResourceMentionByUrl(auth.accessToken, {
        slug: orgSlug,
        url: searchParams.get('url') || ''
      })
    )
  } catch (error) {
    return routeErrorResponse(error)
  }
}
