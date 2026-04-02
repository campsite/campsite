import { withAuth } from '@workos-inc/authkit-nextjs'
import { NextResponse } from 'next/server'

import { getLegacySyncMembers } from '@/lib/convex/organization'
import { ensureWorkspace } from '@/lib/convex/server'
import { routeErrorResponse } from '@/lib/routeErrors'

export async function GET(_: Request, { params }: { params: { orgSlug: string } }) {
  const { accessToken, user } = await withAuth()

  if (!user || !accessToken) {
    return NextResponse.json({ code: 'unauthorized', message: 'Sign in required' }, { status: 401 })
  }

  try {
    await ensureWorkspace(accessToken, user)

    return NextResponse.json(
      await getLegacySyncMembers(accessToken, {
        slug: params.orgSlug
      })
    )
  } catch (error) {
    return routeErrorResponse(error)
  }
}
