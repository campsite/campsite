import { NextResponse } from 'next/server'

import { getLegacySearchMixed } from '@/lib/convex/search'
import { routeErrorResponse } from '@/lib/routeErrors'
import { getRouteAccess, routeUnauthorizedResponse } from '@/lib/routeSession'

interface Context {
  params: Promise<{ orgSlug: string }>
}

function getFocus(value: string | null): 'posts' | 'calls' | 'notes' | undefined {
  if (value === 'posts' || value === 'calls' || value === 'notes') {
    return value
  }

  return undefined
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
      await getLegacySearchMixed(auth.accessToken, {
        slug: orgSlug,
        q: searchParams.get('q') || '',
        focus: getFocus(searchParams.get('focus'))
      })
    )
  } catch (error) {
    return routeErrorResponse(error)
  }
}
