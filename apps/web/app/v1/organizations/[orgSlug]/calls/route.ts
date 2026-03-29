import { NextResponse } from 'next/server'

import { getCallsCompatClient, parseOptionalInteger } from './_compat'

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
  const client = getCallsCompatClient(auth.accessToken)

  try {
    await client.promoteCompatCalls({ slug: orgSlug })

    return NextResponse.json(
      await client.getCallsPage({
        slug: orgSlug,
        filter: searchParams.get('filter') === 'joined' ? 'joined' : undefined,
        after: searchParams.get('after') || undefined,
        limit: parseOptionalInteger(searchParams.get('limit')),
        q: searchParams.get('q') || undefined
      })
    )
  } catch (error) {
    return routeErrorResponse(error)
  }
}
