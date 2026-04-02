import { withAuth } from '@workos-inc/authkit-nextjs'
import { NextResponse } from 'next/server'

import { ensureWorkspace, getLegacyMemberPostsPage } from '@/lib/convex/server'
import { routeErrorResponse } from '@/lib/routeErrors'

export async function GET(request: Request, { params }: { params: { orgSlug: string; memberParam: string } }) {
  const { accessToken, user } = await withAuth()

  if (!user || !accessToken) {
    return NextResponse.json({ code: 'unauthorized', message: 'Sign in required' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)

    await ensureWorkspace(accessToken, user)

    return NextResponse.json(
      await getLegacyMemberPostsPage(accessToken, {
        slug: params.orgSlug,
        username: params.memberParam,
        after: searchParams.get('after') || undefined,
        limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined,
        order: searchParams.get('order[by]') && searchParams.get('order[direction]')
          ? {
              by: searchParams.get('order[by]') as 'last_activity_at' | 'published_at',
              direction: searchParams.get('order[direction]') as 'asc' | 'desc'
            }
          : undefined
      })
    )
  } catch (error) {
    return routeErrorResponse(error)
  }
}
