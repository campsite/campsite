import { withAuth } from '@workos-inc/authkit-nextjs'
import { NextResponse } from 'next/server'

import { getConvexServerClient } from '@/lib/convex/server'
import { api } from '@/convex/_generated/api'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: Request) {
  const { accessToken } = await withAuth()

  if (!accessToken) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(request.url)
  const orgId = url.searchParams.get('org_id')

  if (!orgId || orgId.length < 6) {
    return NextResponse.json({ message: 'Invalid org ID' }, { status: 400 })
  }

  const client = getConvexServerClient(accessToken)
  const org = await client.query(api.onboarding.getOrganizationByPublicId, { orgId })

  if (!org) {
    return NextResponse.json({ message: 'Organization not found' }, { status: 404 })
  }

  return NextResponse.json(org)
}
