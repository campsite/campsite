import { withAuth } from '@workos-inc/authkit-nextjs'
import { NextResponse } from 'next/server'

import { ensureWorkspace, getLegacyOrganization, getLegacyPollOptionVotersPage } from '@/lib/convex/server'

export async function GET(
  request: Request,
  { params }: { params: { orgSlug: string; postId: string; pollOptionId: string } }
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

  const searchParams = new URL(request.url).searchParams

  try {
    return NextResponse.json(
      await getLegacyPollOptionVotersPage(accessToken, {
        slug: params.orgSlug,
        postId: params.postId,
        pollOptionId: params.pollOptionId,
        after: searchParams.get('after') || undefined,
        limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined
      })
    )
  } catch (error) {
    return NextResponse.json(
      {
        code: 'not_found',
        message: error instanceof Error ? error.message : 'Poll option not found'
      },
      { status: 404 }
    )
  }
}
