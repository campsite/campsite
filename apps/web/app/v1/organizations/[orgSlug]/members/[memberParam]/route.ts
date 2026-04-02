import { withAuth } from '@workos-inc/authkit-nextjs'
import { NextResponse } from 'next/server'

import {
  deactivateLegacyOrganizationMember,
  getLegacyOrganizationMemberByUsername,
  updateLegacyOrganizationMemberRole
} from '@/lib/convex/organization'
import { ensureWorkspace } from '@/lib/convex/server'
import { routeErrorResponse } from '@/lib/routeErrors'

export async function GET(_: Request, { params }: { params: { orgSlug: string; memberParam: string } }) {
  const { accessToken, user } = await withAuth()

  if (!user || !accessToken) {
    return NextResponse.json({ code: 'unauthorized', message: 'Sign in required' }, { status: 401 })
  }

  try {
    await ensureWorkspace(accessToken, user)

    const member = await getLegacyOrganizationMemberByUsername(accessToken, {
      slug: params.orgSlug,
      username: params.memberParam
    })

    return NextResponse.json(member)
  } catch (error) {
    return routeErrorResponse(error)
  }
}

export async function PUT(request: Request, { params }: { params: { orgSlug: string; memberParam: string } }) {
  const { accessToken, user } = await withAuth()

  if (!user || !accessToken) {
    return NextResponse.json({ code: 'unauthorized', message: 'Sign in required' }, { status: 401 })
  }

  try {
    const body = await request.json()

    await ensureWorkspace(accessToken, user)

    const member = await updateLegacyOrganizationMemberRole(accessToken, {
      slug: params.orgSlug,
      membershipId: params.memberParam,
      role: body.role
    })

    return NextResponse.json(member)
  } catch (error) {
    return routeErrorResponse(error)
  }
}

export async function DELETE(_: Request, { params }: { params: { orgSlug: string; memberParam: string } }) {
  const { accessToken, user } = await withAuth()

  if (!user || !accessToken) {
    return NextResponse.json({ code: 'unauthorized', message: 'Sign in required' }, { status: 401 })
  }

  try {
    await ensureWorkspace(accessToken, user)
    await deactivateLegacyOrganizationMember(accessToken, {
      slug: params.orgSlug,
      membershipId: params.memberParam
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    return routeErrorResponse(error)
  }
}
