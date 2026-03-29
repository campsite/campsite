import { NextResponse } from 'next/server'

import { createLegacyCustomReaction, getLegacyCustomReactionsPage } from '@/lib/convex/collaboration'
import { routeErrorResponse } from '@/lib/routeErrors'
import { getRouteAccess, routeUnauthorizedResponse } from '@/lib/routeSession'

export async function GET(request: Request, { params }: { params: { orgSlug: string } }) {
  const auth = await getRouteAccess()

  if (!auth) {
    return routeUnauthorizedResponse()
  }

  const url = new URL(request.url)
  const limit = Number(url.searchParams.get('limit') || '')

  try {
    return NextResponse.json(
      await getLegacyCustomReactionsPage(auth.accessToken, {
        slug: params.orgSlug,
        after: url.searchParams.get('after') || undefined,
        limit: Number.isFinite(limit) ? limit : undefined
      })
    )
  } catch (error) {
    return routeErrorResponse(error)
  }
}

export async function POST(request: Request, { params }: { params: { orgSlug: string } }) {
  const auth = await getRouteAccess()

  if (!auth) {
    return routeUnauthorizedResponse()
  }

  const body = await request.json()

  try {
    return NextResponse.json(
      await createLegacyCustomReaction(auth.accessToken, {
        slug: params.orgSlug,
        name: typeof body.name === 'string' ? body.name : '',
        filePath: typeof body.file_path === 'string' ? body.file_path : '',
        fileType: typeof body.file_type === 'string' ? body.file_type : ''
      }),
      { status: 201 }
    )
  } catch (error) {
    return routeErrorResponse(error)
  }
}
