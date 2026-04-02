import { withAuth } from '@workos-inc/authkit-nextjs'
import { NextResponse } from 'next/server'

import { ensureWorkspace, getLegacyOrganization, getLegacyPostSeoInfo } from '@/lib/convex/server'

export async function GET(_: Request, { params }: { params: { orgSlug: string; postId: string } }) {
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
      await getLegacyPostSeoInfo(accessToken, {
        slug: params.orgSlug,
        postId: params.postId
      })
    )
  } catch (error) {
    return NextResponse.json(
      {
        code: 'not_found',
        message: error instanceof Error ? error.message : 'Post not found'
      },
      { status: 404 }
    )
  }
}
