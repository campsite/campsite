import { withAuth } from '@workos-inc/authkit-nextjs'
import { NextResponse } from 'next/server'

import { ensureWorkspace, getLegacyOrganization, getLegacyPostCanvasComments } from '@/lib/convex/server'

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

  return NextResponse.json(
    await getLegacyPostCanvasComments(accessToken, {
      slug: params.orgSlug,
      postId: params.postId
    })
  )
}
