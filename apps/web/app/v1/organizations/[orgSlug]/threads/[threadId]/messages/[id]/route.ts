import { NextResponse } from 'next/server'

import { deleteLegacyThreadMessage, updateLegacyThreadMessage } from '@/lib/convex/threads'
import { routeErrorResponse } from '@/lib/routeErrors'
import { getRouteAccess, routeUnauthorizedResponse } from '@/lib/routeSession'

interface Context {
  params: Promise<{ orgSlug: string; threadId: string; id: string }>
}

export async function PUT(request: Request, context: Context) {
  const auth = await getRouteAccess()
  const { id, orgSlug, threadId } = await context.params

  if (!auth) {
    return routeUnauthorizedResponse()
  }

  const body = await request.json()

  try {
    return NextResponse.json(
      await updateLegacyThreadMessage(auth.accessToken, {
        slug: orgSlug,
        threadId,
        messageId: id,
        content: typeof body.content === 'string' ? body.content : ''
      })
    )
  } catch (error) {
    return routeErrorResponse(error)
  }
}

export async function DELETE(_: Request, context: Context) {
  const auth = await getRouteAccess()
  const { id, orgSlug, threadId } = await context.params

  if (!auth) {
    return routeUnauthorizedResponse()
  }

  try {
    return NextResponse.json(
      await deleteLegacyThreadMessage(auth.accessToken, {
        slug: orgSlug,
        threadId,
        messageId: id
      })
    )
  } catch (error) {
    return routeErrorResponse(error)
  }
}
