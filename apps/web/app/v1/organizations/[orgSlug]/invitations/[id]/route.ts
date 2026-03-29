import { withAuth } from '@workos-inc/authkit-nextjs'
import { NextResponse } from 'next/server'

import { deleteLegacyOrganizationInvitation } from '@/lib/convex/onboarding'
import { ensureWorkspace } from '@/lib/convex/server'

export async function DELETE(_: Request, { params }: { params: { orgSlug: string; id: string } }) {
  const { accessToken, user } = await withAuth()

  if (!user || !accessToken) {
    return NextResponse.json({ code: 'unauthorized', message: 'Sign in required' }, { status: 401 })
  }

  await ensureWorkspace(accessToken, user)

  try {
    await deleteLegacyOrganizationInvitation(accessToken, {
      slug: params.orgSlug,
      invitationId: params.id
    })

    return NextResponse.json({}, { status: 204 })
  } catch (error) {
    return NextResponse.json(
      {
        code: 'unprocessable',
        message: error instanceof Error ? error.message : 'Invitation could not be removed'
      },
      { status: 422 }
    )
  }
}
