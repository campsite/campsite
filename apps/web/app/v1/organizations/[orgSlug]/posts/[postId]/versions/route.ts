import { withAuth } from '@workos-inc/authkit-nextjs'
import { NextResponse } from 'next/server'

import { createLegacyPost, ensureWorkspace, getLegacyOrganization, getLegacyPost, getLegacyPostVersions } from '@/lib/convex/server'

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
    await getLegacyPostVersions(accessToken, {
      slug: params.orgSlug,
      postId: params.postId
    })
  )
}

export async function POST(_: Request, { params }: { params: { orgSlug: string; postId: string } }) {
  const { accessToken, user } = await withAuth()

  if (!user || !accessToken) {
    return NextResponse.json({ code: 'unauthorized', message: 'Sign in required' }, { status: 401 })
  }

  await ensureWorkspace(accessToken, user)
  const organization = await getLegacyOrganization(accessToken, params.orgSlug)

  if (!organization) {
    return NextResponse.json({ code: 'not_found', message: 'Organization not found' }, { status: 404 })
  }

  const currentPost = await getLegacyPost(accessToken, {
    slug: params.orgSlug,
    postId: params.postId
  })

  if (!currentPost) {
    return NextResponse.json({ code: 'not_found', message: 'Post not found' }, { status: 404 })
  }

  const created = await createLegacyPost(accessToken, {
    slug: params.orgSlug,
    parent_id: params.postId,
    project_id: currentPost.project.id,
    title: currentPost.title,
    description_html: currentPost.description_html,
    status: currentPost.status,
    feedback_request_member_ids:
      currentPost.feedback_requests?.flatMap((request: any) => (request?.member?.id ? [request.member.id] : [])) ?? [],
    tags: currentPost.tags.map((tag: any) => tag.name),
    poll: currentPost.poll
      ? {
          description: currentPost.poll.description,
          options: currentPost.poll.options
            .map((option: any) => option?.description)
            .filter((description: unknown): description is string => typeof description === 'string')
            .map((description: string) => ({
              description
            }))
        }
      : undefined,
    attachments: [],
    links: currentPost.links.map((link: { name: string; url: string }) => ({
      name: link.name,
      url: link.url
    }))
  })

  return NextResponse.json(created, { status: 201 })
}
