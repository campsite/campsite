import { withAuth } from '@workos-inc/authkit-nextjs'
import { NextResponse } from 'next/server'

import { ensureWorkspace, resolveLegacyComment, unresolveLegacyComment } from '@/lib/convex/server'

export async function POST(_: Request, { params }: { params: { orgSlug: string; commentId: string } }) {
  const { accessToken, user } = await withAuth()

  if (!user || !accessToken) {
    return NextResponse.json({ code: 'unauthorized', message: 'Sign in required' }, { status: 401 })
  }

  await ensureWorkspace(accessToken, user)
  await resolveLegacyComment(accessToken, {
    slug: params.orgSlug,
    commentId: params.commentId
  })

  return NextResponse.json({})
}

export async function DELETE(_: Request, { params }: { params: { orgSlug: string; commentId: string } }) {
  const { accessToken, user } = await withAuth()

  if (!user || !accessToken) {
    return NextResponse.json({ code: 'unauthorized', message: 'Sign in required' }, { status: 401 })
  }

  await ensureWorkspace(accessToken, user)
  await unresolveLegacyComment(accessToken, {
    slug: params.orgSlug,
    commentId: params.commentId
  })

  return NextResponse.json({})
}
