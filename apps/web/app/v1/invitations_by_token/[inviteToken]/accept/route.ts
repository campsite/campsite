import { withAuth } from '@workos-inc/authkit-nextjs'
import { NextResponse } from 'next/server'

import { acceptLegacyOrganizationInvitationByToken } from '@/lib/convex/onboarding'
import { ensureWorkspace } from '@/lib/convex/server'

export async function POST(_: Request, { params }: { params: { inviteToken: string } }) {
  const { accessToken, user } = await withAuth()

  if (!user || !accessToken) {
    return NextResponse.json({ code: 'unauthorized', message: 'Sign in required' }, { status: 401 })
  }

  await ensureWorkspace(accessToken, user)

  try {
    return NextResponse.json(
      await acceptLegacyOrganizationInvitationByToken(accessToken, { inviteToken: params.inviteToken }),
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json(
      {
        code: 'unprocessable',
        message: error instanceof Error ? error.message : 'Invitation could not be accepted'
      },
      { status: 422 }
    )
  }
}
