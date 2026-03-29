import { withAuth } from '@workos-inc/authkit-nextjs'
import { NextResponse } from 'next/server'

import { ensureWorkspace, getLegacyOrganizationMemberships } from '@/lib/convex/server'

export async function GET() {
  const { accessToken, user } = await withAuth()

  if (!user || !accessToken) {
    return NextResponse.json([])
  }

  await ensureWorkspace(accessToken, user)

  return NextResponse.json(await getLegacyOrganizationMemberships(accessToken))
}
