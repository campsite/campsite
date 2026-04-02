import { withAuth } from '@workos-inc/authkit-nextjs'
import { NextResponse } from 'next/server'

import { deleteLegacyComment, ensureWorkspace, getLegacyComment, getLegacyOrganization, updateLegacyComment } from '@/lib/convex/server'

export async function GET(_: Request, { params }: { params: { orgSlug: string; commentId: string } }) {
  const { accessToken, user } = await withAuth()

  if (!user || !accessToken) {
    return NextResponse.json({ code: 'unauthorized', message: 'Sign in required' }, { status: 401 })
  }

  await ensureWorkspace(accessToken, user)
  const organization = await getLegacyOrganization(accessToken, params.orgSlug)

  if (!organization) {
    return NextResponse.json({ code: 'not_found', message: 'Organization not found' }, { status: 404 })
  }

  const comment = await getLegacyComment(accessToken, {
    slug: params.orgSlug,
    commentId: params.commentId
  })

  if (!comment) {
    return NextResponse.json({ code: 'not_found', message: 'Comment not found' }, { status: 404 })
  }

  return NextResponse.json(comment)
}

export async function PUT(request: Request, { params }: { params: { orgSlug: string; commentId: string } }) {
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
      await updateLegacyComment(accessToken, {
        slug: params.orgSlug,
        commentId: params.commentId,
        body_html: typeof body.body_html === 'string' ? body.body_html : null
      })
    )
  } catch (error) {
    return NextResponse.json(
      {
        code: 'invalid_comment',
        message: error instanceof Error ? error.message : 'Comment could not be updated'
      },
      { status: 400 }
    )
  }
}

export async function DELETE(_: Request, { params }: { params: { orgSlug: string; commentId: string } }) {
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
      await deleteLegacyComment(accessToken, {
        slug: params.orgSlug,
        commentId: params.commentId
      })
    )
  } catch (error) {
    return NextResponse.json(
      {
        code: 'invalid_comment',
        message: error instanceof Error ? error.message : 'Comment could not be deleted'
      },
      { status: 400 }
    )
  }
}
