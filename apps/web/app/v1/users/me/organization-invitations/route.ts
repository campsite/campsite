import { withAuth } from '@workos-inc/authkit-nextjs'
import { NextResponse } from 'next/server'

import { getLegacyViewerOrganizationInvitations } from '@/lib/convex/onboarding'
import { ensureWorkspace } from '@/lib/convex/server'

export async function GET() {
  const { accessToken, user } = await withAuth()

  if (!user || !accessToken) {
    return NextResponse.json([])
  }

  await ensureWorkspace(accessToken, user)

  return NextResponse.json(await getLegacyViewerOrganizationInvitations(accessToken))
}
