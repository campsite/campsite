import { withAuth } from '@workos-inc/authkit-nextjs'
import { NextResponse } from 'next/server'

import { bulkInviteLegacyOrganizationMembers } from '@/lib/convex/onboarding'
import { ensureWorkspace } from '@/lib/convex/server'

export async function POST(request: Request, { params }: { params: { orgSlug: string } }) {
  const { accessToken, user } = await withAuth()

  if (!user || !accessToken) {
    return NextResponse.json({ code: 'unauthorized', message: 'Sign in required' }, { status: 401 })
  }

  const body = await request.json()

  await ensureWorkspace(accessToken, user)

  try {
    return NextResponse.json(
      await bulkInviteLegacyOrganizationMembers(accessToken, {
        slug: params.orgSlug,
        comma_separated_emails:
          typeof body.comma_separated_emails === 'string' ? body.comma_separated_emails : '',
        project_id: typeof body.project_id === 'string' ? body.project_id : undefined
      }),
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json(
      {
        code: 'unprocessable',
        message: error instanceof Error ? error.message : 'Invitations could not be sent'
      },
      { status: 422 }
    )
  }
}
