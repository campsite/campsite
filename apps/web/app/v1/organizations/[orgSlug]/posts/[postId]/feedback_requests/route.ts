import { withAuth } from '@workos-inc/authkit-nextjs'
import { NextResponse } from 'next/server'

import { createLegacyPostFeedbackRequest, ensureWorkspace, getLegacyOrganization } from '@/lib/convex/server'

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
      await createLegacyPostFeedbackRequest(accessToken, {
        slug: params.orgSlug,
        postId: params.postId,
        memberId: typeof body.member_id === 'string' ? body.member_id : ''
      })
    )
  } catch (error) {
    return NextResponse.json(
      {
        code: 'invalid_feedback_request',
        message: error instanceof Error ? error.message : 'Feedback request could not be created'
      },
      { status: 400 }
    )
  }
}
