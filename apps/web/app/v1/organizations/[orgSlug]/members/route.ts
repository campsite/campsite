import { withAuth } from '@workos-inc/authkit-nextjs'
import { NextResponse } from 'next/server'

import { ensureWorkspace } from '@/lib/convex/server'
import { getLegacyOrganizationMembersPage } from '@/lib/convex/organization'
import { routeErrorResponse } from '@/lib/routeErrors'

export async function GET(request: Request, { params }: { params: { orgSlug: string } }) {
  const { accessToken, user } = await withAuth()

  if (!user || !accessToken) {
    return NextResponse.json({ code: 'unauthorized', message: 'Sign in required' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)

    await ensureWorkspace(accessToken, user)

    const data = await getLegacyOrganizationMembersPage(accessToken, {
      slug: params.orgSlug,
      after: searchParams.get('after') || undefined,
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined,
      q: searchParams.get('q') || undefined,
      status: searchParams.get('status') === 'deactivated' ? 'deactivated' : undefined,
      roles: searchParams.getAll('roles').filter(Boolean) as ('admin' | 'member' | 'viewer' | 'guest')[],
      order: searchParams.get('order[by]') && searchParams.get('order[direction]')
        ? {
            by: searchParams.get('order[by]') as 'created_at' | 'last_seen_at',
            direction: searchParams.get('order[direction]') as 'asc' | 'desc'
          }
        : undefined
    })

    return NextResponse.json(data)
  } catch (error) {
    return routeErrorResponse(error)
  }
}
