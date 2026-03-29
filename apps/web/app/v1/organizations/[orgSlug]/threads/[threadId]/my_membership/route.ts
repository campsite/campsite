import { NextResponse } from 'next/server'

import {
  getLegacyThreadMembership,
  leaveLegacyThread,
  updateLegacyThreadMembership
} from '@/lib/convex/threads'
import { routeErrorResponse } from '@/lib/routeErrors'
import { getRouteAccess, routeUnauthorizedResponse } from '@/lib/routeSession'

interface Context {
  params: Promise<{ orgSlug: string; threadId: string }>
}

export async function GET(_: Request, context: Context) {
  const auth = await getRouteAccess()
  const { orgSlug, threadId } = await context.params

  if (!auth) {
    return routeUnauthorizedResponse()
  }

  try {
    return NextResponse.json(await getLegacyThreadMembership(auth.accessToken, { slug: orgSlug, threadId }))
  } catch (error) {
    return routeErrorResponse(error)
  }
}

export async function PUT(request: Request, context: Context) {
  const auth = await getRouteAccess()
  const { orgSlug, threadId } = await context.params

  if (!auth) {
    return routeUnauthorizedResponse()
  }

  const body = await request.json()

  try {
    return NextResponse.json(
      await updateLegacyThreadMembership(auth.accessToken, {
        slug: orgSlug,
        threadId,
        notificationLevel: body.notification_level
      })
    )
  } catch (error) {
    return routeErrorResponse(error)
  }
}

export async function DELETE(_: Request, context: Context) {
  const auth = await getRouteAccess()
  const { orgSlug, threadId } = await context.params

  if (!auth) {
    return routeUnauthorizedResponse()
  }

  try {
    return NextResponse.json(await leaveLegacyThread(auth.accessToken, { slug: orgSlug, threadId }))
  } catch (error) {
    return routeErrorResponse(error)
  }
}
