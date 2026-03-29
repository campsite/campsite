import { NextResponse } from 'next/server'

import { createLegacyTag, getLegacyTagsPage } from '@/lib/convex/tags'
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
      await getLegacyTagsPage(auth.accessToken, {
        slug: orgSlug,
        q: searchParams.get('q') || undefined,
        after: searchParams.get('after') || undefined,
        limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined
      })
    )
  } catch (error) {
    return routeErrorResponse(error)
  }
}

export async function POST(request: Request, context: Context) {
  const auth = await getRouteAccess()
  const { orgSlug } = await context.params

  if (!auth) {
    return routeUnauthorizedResponse()
  }

  const body = await request.json()

  try {
    return NextResponse.json(
      await createLegacyTag(auth.accessToken, {
        slug: orgSlug,
        name: typeof body.name === 'string' ? body.name : ''
      }),
      { status: 201 }
    )
  } catch (error) {
    return routeErrorResponse(error)
  }
}
