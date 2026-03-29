import { NextResponse } from 'next/server'

import { ensureWorkspace, getLegacyPostAttachmentCommentsPage } from '@/lib/convex/server'
import { routeErrorResponse } from '@/lib/routeErrors'
import { getRouteAccess, routeUnauthorizedResponse } from '@/lib/routeSession'

interface Context {
  params: Promise<{ orgSlug: string; postId: string; attachmentId: string }>
}

export async function GET(request: Request, context: Context) {
  const auth = await getRouteAccess()
  const { orgSlug, postId, attachmentId } = await context.params

  if (!auth) {
    return routeUnauthorizedResponse()
  }

  const url = new URL(request.url)
  const limitParam = url.searchParams.get('limit')

  try {
    await ensureWorkspace(auth.accessToken)

    return NextResponse.json(
      await getLegacyPostAttachmentCommentsPage(auth.accessToken, {
        slug: orgSlug,
        postId,
        attachmentId,
        after: url.searchParams.get('after') ?? undefined,
        limit: limitParam ? Number(limitParam) : undefined
      })
    )
  } catch (error) {
    return routeErrorResponse(error)
  }
}
