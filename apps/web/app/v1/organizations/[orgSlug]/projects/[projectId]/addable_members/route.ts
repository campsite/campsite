import { withAuth } from '@workos-inc/authkit-nextjs'
import { NextResponse } from 'next/server'

import { getLegacyProjectAddableMembersPage } from '@/lib/convex/onboarding'
import { ensureWorkspace } from '@/lib/convex/server'
import { routeErrorResponse } from '@/lib/routeErrors'

export async function GET(request: Request, { params }: { params: { orgSlug: string; projectId: string } }) {
  const { accessToken, user } = await withAuth()

  if (!user || !accessToken) {
    return NextResponse.json({ code: 'unauthorized', message: 'Sign in required' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)

    await ensureWorkspace(accessToken, user)

    const data = await getLegacyProjectAddableMembersPage(accessToken, {
      slug: params.orgSlug,
      projectId: params.projectId,
      after: searchParams.get('after') || undefined,
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined
    })

    return NextResponse.json(data)
  } catch (error) {
    return routeErrorResponse(error)
  }
}
