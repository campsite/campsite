import { NextResponse } from 'next/server'

import { deleteLegacyFollowUp, updateLegacyFollowUp } from '@/lib/convex/engagement'
import { routeErrorResponse } from '@/lib/routeErrors'
import { getRouteAccess, routeUnauthorizedResponse } from '@/lib/routeSession'

interface Context {
  params: Promise<{ orgSlug: string; id: string }>
}

function parseShowAt(value: unknown) {
  if (typeof value !== 'string') {
    throw new Error('unprocessable:show_at is required')
  }

  const timestamp = Date.parse(value)

  if (Number.isNaN(timestamp)) {
    throw new Error('unprocessable:show_at must be a valid ISO datetime')
  }

  return timestamp
}

export async function PUT(request: Request, context: Context) {
  const auth = await getRouteAccess()
  const { orgSlug, id } = await context.params

  if (!auth) {
    return routeUnauthorizedResponse()
  }

  const body = await request.json()

  try {
    return NextResponse.json(
      await updateLegacyFollowUp(auth.accessToken, {
        slug: orgSlug,
        id,
        showAt: parseShowAt(body.show_at)
      })
    )
  } catch (error) {
    return routeErrorResponse(error)
  }
}

export async function DELETE(_: Request, context: Context) {
  const auth = await getRouteAccess()
  const { orgSlug, id } = await context.params

  if (!auth) {
    return routeUnauthorizedResponse()
  }

  try {
    return NextResponse.json(await deleteLegacyFollowUp(auth.accessToken, { slug: orgSlug, id }))
  } catch (error) {
    return routeErrorResponse(error)
  }
}
