import { withAuth } from '@workos-inc/authkit-nextjs'
import { NextResponse } from 'next/server'

import { ensureWorkspace, publishLegacyPost } from '@/lib/convex/server'
import { routeErrorResponse } from '@/lib/routeErrors'

export async function POST(_: Request, { params }: { params: { orgSlug: string; postId: string } }) {
  const { accessToken, user } = await withAuth()

  if (!user || !accessToken) {
    return NextResponse.json({ code: 'unauthorized', message: 'Sign in required' }, { status: 401 })
  }

  try {
    await ensureWorkspace(accessToken, user)

    const post = await publishLegacyPost(accessToken, {
      slug: params.orgSlug,
      postId: params.postId
    })

    return NextResponse.json(post)
  } catch (error) {
    return routeErrorResponse(error)
  }
}
