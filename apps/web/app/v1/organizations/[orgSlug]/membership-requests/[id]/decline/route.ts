import { withAuth } from '@workos-inc/authkit-nextjs'
import { NextResponse } from 'next/server'

import { declineLegacyMembershipRequest } from '@/lib/convex/organization'
import { ensureWorkspace } from '@/lib/convex/server'
import { routeErrorResponse } from '@/lib/routeErrors'

export async function POST(_: Request, { params }: { params: { orgSlug: string; id: string } }) {
  const { accessToken, user } = await withAuth()

  if (!user || !accessToken) {
    return NextResponse.json({ code: 'unauthorized', message: 'Sign in required' }, { status: 401 })
  }

  try {
    await ensureWorkspace(accessToken, user)
    await declineLegacyMembershipRequest(accessToken, {
      slug: params.orgSlug,
      requestId: params.id
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    return routeErrorResponse(error)
  }
}
