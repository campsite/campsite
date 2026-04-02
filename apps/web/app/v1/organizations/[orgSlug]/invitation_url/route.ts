import { withAuth } from '@workos-inc/authkit-nextjs'
import { NextResponse } from 'next/server'

import { normalizeInvitationUrl } from '@/lib/convex/compat'
import { getLegacyInvitationUrl } from '@/lib/convex/onboarding'
import { ensureWorkspace } from '@/lib/convex/server'

export async function GET(_: Request, { params }: { params: { orgSlug: string } }) {
  const { accessToken, user } = await withAuth()

  if (!user || !accessToken) {
    return NextResponse.json({ code: 'unauthorized', message: 'Sign in required' }, { status: 401 })
  }

  await ensureWorkspace(accessToken, user)

  try {
    return NextResponse.json(normalizeInvitationUrl(await getLegacyInvitationUrl(accessToken, { slug: params.orgSlug })))
  } catch (error) {
    return NextResponse.json(
      {
        code: 'not_found',
        message: error instanceof Error ? error.message : 'Invitation URL not found'
      },
      { status: 404 }
    )
  }
}
