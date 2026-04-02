import { withAuth } from '@workos-inc/authkit-nextjs'
import { NextResponse } from 'next/server'

import { ensureWorkspace, resolveLegacyPost, unresolveLegacyPost } from '@/lib/convex/server'

export async function POST(request: Request, { params }: { params: { orgSlug: string; postId: string } }) {
  const { accessToken, user } = await withAuth()

  if (!user || !accessToken) {
    return NextResponse.json({ code: 'unauthorized', message: 'Sign in required' }, { status: 401 })
  }

  await ensureWorkspace(accessToken, user)

  const body = await request.json().catch(() => null)

  await resolveLegacyPost(accessToken, {
    slug: params.orgSlug,
    postId: params.postId,
    resolve_html: typeof body?.resolve_html === 'string' || body?.resolve_html === null ? body.resolve_html : null,
    comment_id: typeof body?.comment_id === 'string' || body?.comment_id === null ? body.comment_id : null
  })

  return NextResponse.json({})
}

export async function DELETE(_: Request, { params }: { params: { orgSlug: string; postId: string } }) {
  const { accessToken, user } = await withAuth()

  if (!user || !accessToken) {
    return NextResponse.json({ code: 'unauthorized', message: 'Sign in required' }, { status: 401 })
  }

  await ensureWorkspace(accessToken, user)
  await unresolveLegacyPost(accessToken, {
    slug: params.orgSlug,
    postId: params.postId
  })

  return NextResponse.json({})
}
