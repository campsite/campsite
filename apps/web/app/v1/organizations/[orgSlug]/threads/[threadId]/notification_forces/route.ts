import { NextResponse } from 'next/server'

import { forceLegacyThreadNotification } from '@/lib/convex/threads'
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
    return NextResponse.json(await forceLegacyThreadNotification(auth.accessToken, { slug: orgSlug, threadId }))
  } catch (error) {
    return routeErrorResponse(error)
  }
}
