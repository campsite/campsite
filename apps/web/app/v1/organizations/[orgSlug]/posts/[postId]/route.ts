import { withAuth } from '@workos-inc/authkit-nextjs'
import { NextResponse } from 'next/server'

import { deleteLegacyPost, ensureWorkspace, getLegacyOrganization, getLegacyPost, updateLegacyPost } from '@/lib/convex/server'

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

  const post = await getLegacyPost(accessToken, {
    slug: params.orgSlug,
    postId: params.postId
  })

  if (!post) {
    return NextResponse.json({ code: 'not_found', message: 'Post not found' }, { status: 404 })
  }

  return NextResponse.json(post)
}

export async function PUT(request: Request, { params }: { params: { orgSlug: string; postId: string } }) {
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
    const post = await updateLegacyPost(accessToken, {
      slug: params.orgSlug,
      postId: params.postId,
      title: typeof body.title === 'string' ? body.title : undefined,
      description_html: typeof body.description_html === 'string' ? body.description_html : undefined,
      project_id: typeof body.project_id === 'string' ? body.project_id : body.project_id === null ? null : undefined,
      unfurled_link:
        typeof body.unfurled_link === 'string' ? body.unfurled_link : body.unfurled_link === null ? null : undefined,
      status: body.status === 'feedback_requested' ? 'feedback_requested' : body.status === 'none' ? 'none' : undefined
    })

    return NextResponse.json(post)
  } catch (error) {
    return NextResponse.json(
      {
        code: 'invalid_post',
        message: error instanceof Error ? error.message : 'Post could not be updated'
      },
      { status: 400 }
    )
  }
}

export async function DELETE(_: Request, { params }: { params: { orgSlug: string; postId: string } }) {
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
    await deleteLegacyPost(accessToken, {
      slug: params.orgSlug,
      postId: params.postId
    })

    return NextResponse.json({})
  } catch (error) {
    return NextResponse.json(
      {
        code: 'invalid_post',
        message: error instanceof Error ? error.message : 'Post could not be deleted'
      },
      { status: 400 }
    )
  }
}
