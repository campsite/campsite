import { NextResponse } from 'next/server'

import { markLegacyThreadRead, markLegacyThreadUnread } from '@/lib/convex/threads'
import { routeErrorResponse } from '@/lib/routeErrors'
import { getRouteAccess, routeUnauthorizedResponse } from '@/lib/routeSession'

interface Context {
  params: Promise<{ orgSlug: string; threadId: string }>
}

export async function POST(_: Request, context: Context) {
  const auth = await getRouteAccess()
  const { orgSlug, threadId } = await context.params

  if (!auth) {
    return routeUnauthorizedResponse()
  }

  try {
    return NextResponse.json(await markLegacyThreadRead(auth.accessToken, { slug: orgSlug, threadId }))
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
    return NextResponse.json(await markLegacyThreadUnread(auth.accessToken, { slug: orgSlug, threadId }))
  } catch (error) {
    return routeErrorResponse(error)
  }
}
