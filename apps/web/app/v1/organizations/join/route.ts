import { withAuth } from '@workos-inc/authkit-nextjs'
import { NextResponse } from 'next/server'

import { getConvexServerClient } from '@/lib/convex/server'
import { api } from '@/convex/_generated/api'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: Request) {
  const { accessToken } = await withAuth()

  if (!accessToken) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const orgId = body?.org_id?.trim()

  if (!orgId) {
    return NextResponse.json({ message: 'Org ID is required' }, { status: 400 })
  }

  try {
    const client = getConvexServerClient(accessToken)
    const result = await client.mutation(api.onboarding.joinOrganizationByPublicId, { orgId })

    return NextResponse.json(result, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Failed to join organization' }, { status: 400 })
  }
}
