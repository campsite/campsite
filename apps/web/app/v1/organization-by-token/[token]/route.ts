import { withAuth } from '@workos-inc/authkit-nextjs'
import { NextResponse } from 'next/server'

import { getLegacyPublicOrganizationByToken } from '@/lib/convex/onboarding'

export async function GET(_: Request, { params }: { params: { token: string } }) {
  const { accessToken } = await withAuth()
  const organization = await getLegacyPublicOrganizationByToken(accessToken, { token: params.token })

  if (!organization) {
    return NextResponse.json({ code: 'not_found', message: 'Organization not found' }, { status: 404 })
  }

  return NextResponse.json(organization)
}
