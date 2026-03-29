import { withAuth } from '@workos-inc/authkit-nextjs'
import { NextResponse } from 'next/server'

import { createLegacyPostComment, ensureWorkspace, getLegacyOrganization } from '@/lib/convex/server'

export async function POST(request: Request, { params }: { params: { orgSlug: string; postId: string } }) {
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
      await createLegacyPostComment(accessToken, {
        slug: params.orgSlug,
        postId: params.postId,
        body_html: typeof body.body_html === 'string' ? body.body_html : null,
        file_id: typeof body.file_id === 'string' ? body.file_id : null,
        timestamp: typeof body.timestamp === 'number' ? body.timestamp : null,
        x: typeof body.x === 'number' ? body.x : null,
        y: typeof body.y === 'number' ? body.y : null,
        note_highlight: typeof body.note_highlight === 'string' ? body.note_highlight : null,
        attachments: Array.isArray(body.attachments) ? body.attachments : undefined
      })
    )
  } catch (error) {
    return NextResponse.json(
      {
        code: 'invalid_comment',
        message: error instanceof Error ? error.message : 'Comment could not be created'
      },
      { status: 400 }
    )
  }
}
