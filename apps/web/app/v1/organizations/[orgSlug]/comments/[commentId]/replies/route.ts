import { withAuth } from '@workos-inc/authkit-nextjs'
import { NextResponse } from 'next/server'

import { createLegacyCommentReply, ensureWorkspace, getLegacyOrganization } from '@/lib/convex/server'

export async function POST(request: Request, { params }: { params: { orgSlug: string; commentId: string } }) {
  const { accessToken, user } = await withAuth()

  if (!user || !accessToken) {
    return NextResponse.json({ code: 'unauthorized', message: 'Sign in required' }, { status: 401 })
  }

  await ensureWorkspace(accessToken, user)
  const organization = await getLegacyOrganization(accessToken, params.orgSlug)

  if (!organization) {
    return NextResponse.json({ code: 'not_found', message: 'Organization not found' }, { status: 404 })
  }

  const body = await request.json()

  try {
    return NextResponse.json(
      await createLegacyCommentReply(accessToken, {
        slug: params.orgSlug,
        commentId: params.commentId,
        body_html: typeof body.body_html === 'string' ? body.body_html : null,
        attachments: Array.isArray(body.attachments) ? body.attachments : undefined
      })
    )
  } catch (error) {
    return NextResponse.json(
      {
        code: 'invalid_comment',
        message: error instanceof Error ? error.message : 'Reply could not be created'
      },
      { status: 400 }
    )
  }
}
