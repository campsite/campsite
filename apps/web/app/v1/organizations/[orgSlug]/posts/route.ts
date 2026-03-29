import { withAuth } from '@workos-inc/authkit-nextjs'
import { NextResponse } from 'next/server'

import { createLegacyPost, ensureWorkspace, getLegacyOrganization, getLegacyPostsPage } from '@/lib/convex/server'

export async function GET(request: Request, { params }: { params: { orgSlug: string } }) {
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
  const q = searchParams.get('q') || undefined
  const limit = searchParams.get('limit')
  const hideResolved = searchParams.get('hide_resolved')

  return NextResponse.json(
    await getLegacyPostsPage(accessToken, {
      slug: params.orgSlug,
      q,
      limit: limit ? Number(limit) : undefined,
      hide_resolved: hideResolved === 'true',
      mode: 'all'
    })
  )
}

export async function POST(request: Request, { params }: { params: { orgSlug: string } }) {
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
    const post = await createLegacyPost(accessToken, {
      slug: params.orgSlug,
      title: typeof body.title === 'string' ? body.title : undefined,
      description: typeof body.description === 'string' ? body.description : undefined,
      description_html: typeof body.description_html === 'string' ? body.description_html : undefined,
      project_id: typeof body.project_id === 'string' ? body.project_id : undefined,
      unfurled_link: typeof body.unfurled_link === 'string' ? body.unfurled_link : null,
      parent_id: typeof body.parent_id === 'string' ? body.parent_id : null,
      links: Array.isArray(body.links) ? body.links : [],
      poll:
        body.poll &&
        typeof body.poll.description === 'string' &&
        Array.isArray(body.poll.options)
          ? {
              description: body.poll.description,
              options: body.poll.options
                .filter((option: any) => option && typeof option.description === 'string')
                .map((option: any) => ({ description: option.description }))
            }
          : undefined,
      feedback_request_member_ids: Array.isArray(body.feedback_request_member_ids)
        ? body.feedback_request_member_ids.filter((memberId: any) => typeof memberId === 'string')
        : undefined,
      tags: Array.isArray(body.tags) ? body.tags.filter((tag: any) => typeof tag === 'string') : undefined,
      status: body.status === 'feedback_requested' ? 'feedback_requested' : undefined,
      draft: Boolean(body.draft),
      attachments: Array.isArray(body.attachments) ? body.attachments : undefined
    })

    return NextResponse.json(post)
  } catch (error) {
    return NextResponse.json(
      {
        code: 'invalid_post',
        message: error instanceof Error ? error.message : 'Post could not be created'
      },
      { status: 400 }
    )
  }
}
