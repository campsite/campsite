import { withAuth } from '@workos-inc/authkit-nextjs'
import { NextResponse } from 'next/server'

import { normalizeLegacyOrganization } from '@/lib/convex/compat'
import { resetLegacyOrganizationInviteToken } from '@/lib/convex/onboarding'
import { ensureWorkspace } from '@/lib/convex/server'

export async function PATCH(_: Request, { params }: { params: { orgSlug: string } }) {
  const { accessToken, user } = await withAuth()

  if (!user || !accessToken) {
    return NextResponse.json({ code: 'unauthorized', message: 'Sign in required' }, { status: 401 })
  }

  await ensureWorkspace(accessToken, user)

  try {
    return NextResponse.json(
      normalizeLegacyOrganization(await resetLegacyOrganizationInviteToken(accessToken, { slug: params.orgSlug }))
    )
  } catch (error) {
    return NextResponse.json(
      {
        code: 'unprocessable',
        message: error instanceof Error ? error.message : 'Invite token could not be reset'
      },
      { status: 422 }
    )
  }
}
