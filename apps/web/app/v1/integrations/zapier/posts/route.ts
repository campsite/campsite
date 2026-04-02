import { NextResponse } from 'next/server'

import { createLegacyPost } from '@/lib/convex/server'
import { routeErrorResponse } from '@/lib/routeErrors'
import { getRouteAccess, routeUnauthorizedResponse } from '@/lib/routeSession'

import { getDefaultZapierProject } from '../_helpers'

export async function POST(request: Request) {
  const auth = await getRouteAccess()

  if (!auth) {
    return routeUnauthorizedResponse()
  }

  const body = (await request.json().catch(() => null)) as
    | {
        title?: string
        content?: string
        project_id?: string
      }
    | null

  try {
    const { organization, project } = await getDefaultZapierProject(auth.accessToken)
    const post = await createLegacyPost(auth.accessToken, {
      slug: organization.slug,
      title: body?.title,
      description_html: body?.content || '',
      project_id: body?.project_id || project?.id,
      links: [],
      attachments: []
    })

    return NextResponse.json({
      id: post.id,
      title: post.title || '',
      created_at: post.created_at,
      published_at: post.published_at,
      url: `${organization.slug}/posts/${post.id}`,
      content: post.description_html || '',
      project_id: post.project?.id || body?.project_id || project?.id || ''
    })
  } catch (error) {
    return routeErrorResponse(error)
  }
}
