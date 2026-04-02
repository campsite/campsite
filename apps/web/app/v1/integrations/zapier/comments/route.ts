import { NextResponse } from 'next/server'

import { createLegacyCommentReply, createLegacyPostComment } from '@/lib/convex/server'
import { routeErrorResponse } from '@/lib/routeErrors'
import { getRouteAccess, routeUnauthorizedResponse } from '@/lib/routeSession'

import { getDefaultZapierOrg } from '../_helpers'

export async function POST(request: Request) {
  const auth = await getRouteAccess()

  if (!auth) {
    return routeUnauthorizedResponse()
  }

  const body = (await request.json().catch(() => null)) as
    | {
        content?: string
        post_id?: string
        parent_id?: string
      }
    | null

  try {
    const organization = await getDefaultZapierOrg(auth.accessToken)
    const comment: any = body?.parent_id
      ? await createLegacyCommentReply(auth.accessToken, {
          slug: organization.slug,
          commentId: body.parent_id,
          body_html: body?.content || ''
        })
      : await createLegacyPostComment(auth.accessToken, {
          slug: organization.slug,
          postId: body?.post_id || '',
          body_html: body?.content || ''
        })

    return NextResponse.json({
      id: comment.id,
      content: comment.body_html || comment.content || '',
      created_at: comment.created_at,
      parent_id: comment.parent_id || null
    })
  } catch (error) {
    return routeErrorResponse(error)
  }
}
