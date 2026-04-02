import { NextResponse } from 'next/server'

import { deleteLegacyMessageAttachment } from '@/lib/convex/threads'
import { routeErrorResponse } from '@/lib/routeErrors'
import { getRouteAccess, routeUnauthorizedResponse } from '@/lib/routeSession'

interface Context {
  params: Promise<{ orgSlug: string; messageId: string; id: string }>
}

export async function DELETE(_: Request, context: Context) {
  const auth = await getRouteAccess()
  const { id, messageId, orgSlug } = await context.params

  if (!auth) {
    return routeUnauthorizedResponse()
  }

  try {
    return NextResponse.json(
      await deleteLegacyMessageAttachment(auth.accessToken, {
        slug: orgSlug,
        messageId,
        attachmentId: id
      })
    )
  } catch (error) {
    return routeErrorResponse(error)
  }
}
