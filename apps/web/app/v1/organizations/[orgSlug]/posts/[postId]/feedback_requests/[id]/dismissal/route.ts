import { withAuth } from '@workos-inc/authkit-nextjs'
import { NextResponse } from 'next/server'

import { dismissLegacyPostFeedbackRequest, ensureWorkspace, getLegacyOrganization } from '@/lib/convex/server'

export async function POST(_: Request, { params }: { params: { orgSlug: string; postId: string; id: string } }) {
  const { accessToken, user } = await withAuth()

  if (!user || !accessToken) {
    return NextResponse.json({ code: 'unauthorized', message: 'Sign in required' }, { status: 401 })
  }

  await ensureWorkspace(accessToken, user)
  const organization = await getLegacyOrganization(accessToken, params.orgSlug)

  if (!organization) {
    return NextResponse.json({ code: 'not_found', message: 'Organization not found' }, { status: 404 })
  }

  try {
    return NextResponse.json(
      await dismissLegacyPostFeedbackRequest(accessToken, {
        slug: params.orgSlug,
        postId: params.postId,
        feedbackRequestId: params.id
      })
    )
  } catch (error) {
    return NextResponse.json(
      {
        code: 'invalid_feedback_request',
        message: error instanceof Error ? error.message : 'Feedback request could not be dismissed'
      },
      { status: 400 }
    )
  }
}
