import { NextResponse } from 'next/server'

import { updateLegacyThreadOtherMembers } from '@/lib/convex/threads'
import { routeErrorResponse } from '@/lib/routeErrors'
import { getRouteAccess, routeUnauthorizedResponse } from '@/lib/routeSession'

interface Context {
  params: Promise<{ orgSlug: string; threadId: string }>
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
      await updateLegacyThreadOtherMembers(auth.accessToken, {
        slug: orgSlug,
        threadId,
        memberIds: Array.isArray(body.member_ids) ? body.member_ids : []
      })
    )
  } catch (error) {
    return routeErrorResponse(error)
  }
}
