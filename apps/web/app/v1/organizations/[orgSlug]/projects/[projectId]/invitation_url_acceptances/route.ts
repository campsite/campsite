import { withAuth } from '@workos-inc/authkit-nextjs'
import { NextResponse } from 'next/server'

import { acceptLegacyProjectInvitationUrl } from '@/lib/convex/onboarding'
import { ensureWorkspace } from '@/lib/convex/server'
import { routeErrorResponse } from '@/lib/routeErrors'

export async function POST(request: Request, { params }: { params: { orgSlug: string; projectId: string } }) {
  const { accessToken, user } = await withAuth()

  if (!user || !accessToken) {
    return NextResponse.json({ code: 'unauthorized', message: 'Sign in required' }, { status: 401 })
  }

  try {
    const body = await request.json()

    await ensureWorkspace(accessToken, user)

    return NextResponse.json(
      await acceptLegacyProjectInvitationUrl(accessToken, {
        slug: params.orgSlug,
        projectId: params.projectId,
        token: String(body.token)
      }),
      { status: 201 }
    )
  } catch (error) {
    return routeErrorResponse(error)
  }
}
