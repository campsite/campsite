import { withAuth } from '@workos-inc/authkit-nextjs'
import { NextResponse } from 'next/server'

import {
  createLegacyMembershipRequest,
  getLegacyOrganizationMembershipRequestsPage
} from '@/lib/convex/organization'
import { ensureWorkspace } from '@/lib/convex/server'
import { routeErrorResponse } from '@/lib/routeErrors'

export async function GET(request: Request, { params }: { params: { orgSlug: string } }) {
  const { accessToken, user } = await withAuth()

  if (!user || !accessToken) {
    return NextResponse.json({ code: 'unauthorized', message: 'Sign in required' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)

    await ensureWorkspace(accessToken, user)

    return NextResponse.json(
      await getLegacyOrganizationMembershipRequestsPage(accessToken, {
        slug: params.orgSlug,
        after: searchParams.get('after') || undefined
      })
    )
  } catch (error) {
    return routeErrorResponse(error)
  }
}

export async function POST(_: Request, { params }: { params: { orgSlug: string } }) {
  const { accessToken, user } = await withAuth()

  if (!user || !accessToken) {
    return NextResponse.json({ code: 'unauthorized', message: 'Sign in required' }, { status: 401 })
  }

  try {
    await ensureWorkspace(accessToken, user)

    return NextResponse.json(
      await createLegacyMembershipRequest(accessToken, {
        slug: params.orgSlug
      }),
      { status: 201 }
    )
  } catch (error) {
    return routeErrorResponse(error)
  }
}
