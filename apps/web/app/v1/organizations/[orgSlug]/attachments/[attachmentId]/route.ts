import { NextResponse } from 'next/server'

import { ensureWorkspace, getLegacyAttachmentById } from '@/lib/convex/server'
import { routeErrorResponse } from '@/lib/routeErrors'
import { getRouteAccess, routeUnauthorizedResponse } from '@/lib/routeSession'

interface Context {
  params: Promise<{ orgSlug: string; attachmentId: string }>
}

export async function GET(_: Request, context: Context) {
  const auth = await getRouteAccess()
  const { orgSlug, attachmentId } = await context.params

  if (!auth) {
    return routeUnauthorizedResponse()
  }

  try {
    await ensureWorkspace(auth.accessToken)

    return NextResponse.json(
      await getLegacyAttachmentById(auth.accessToken, {
        slug: orgSlug,
        attachmentId
      })
    )
  } catch (error) {
    return routeErrorResponse(error)
  }
}
