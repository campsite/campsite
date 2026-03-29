import { withAuth } from '@workos-inc/authkit-nextjs'
import { NextResponse } from 'next/server'

import {
  createLegacyOrganizationInvitations,
  getLegacyOrganizationInvitationsPage
} from '@/lib/convex/onboarding'
import { ensureWorkspace } from '@/lib/convex/server'

export async function GET(request: Request, { params }: { params: { orgSlug: string } }) {
  const { accessToken, user } = await withAuth()

  if (!user || !accessToken) {
    return NextResponse.json({ code: 'unauthorized', message: 'Sign in required' }, { status: 401 })
  }

  const searchParams = new URL(request.url).searchParams

  await ensureWorkspace(accessToken, user)

  return NextResponse.json(
    await getLegacyOrganizationInvitationsPage(accessToken, {
      slug: params.orgSlug,
      q: searchParams.get('q') || undefined,
      role_counted: searchParams.get('role_counted') === 'true',
      after: searchParams.get('after') || undefined
    })
  )
}

export async function POST(request: Request, { params }: { params: { orgSlug: string } }) {
  const { accessToken, user } = await withAuth()

  if (!user || !accessToken) {
    return NextResponse.json({ code: 'unauthorized', message: 'Sign in required' }, { status: 401 })
  }

  const body = await request.json()

  await ensureWorkspace(accessToken, user)

  try {
    return NextResponse.json(
      await createLegacyOrganizationInvitations(accessToken, {
        slug: params.orgSlug,
        invitations: Array.isArray(body.invitations) ? body.invitations : []
      }),
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json(
      {
        code: 'unprocessable',
        message: error instanceof Error ? error.message : 'Invitations could not be created'
      },
      { status: 422 }
    )
  }
}
