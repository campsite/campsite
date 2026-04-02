import { withAuth } from '@workos-inc/authkit-nextjs'
import { NextResponse } from 'next/server'

import { ensureWorkspace, getLegacyOrganization, voteLegacyPostPollOption } from '@/lib/convex/server'

export async function POST(
  _: Request,
  { params }: { params: { orgSlug: string; postId: string; optionId: string } }
) {
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
      await voteLegacyPostPollOption(accessToken, {
        slug: params.orgSlug,
        postId: params.postId,
        optionId: params.optionId
      })
    )
  } catch (error) {
    return NextResponse.json(
      {
        code: 'invalid_poll_vote',
        message: error instanceof Error ? error.message : 'Poll vote could not be created'
      },
      { status: 400 }
    )
  }
}
