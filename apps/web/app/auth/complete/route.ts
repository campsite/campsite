import { withAuth } from '@workos-inc/authkit-nextjs'
import * as Sentry from '@sentry/nextjs'
import { NextResponse } from 'next/server'

import { getLegacyOrganizationMemberships } from '@/lib/convex/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: Request) {
  const baseUrl = new URL(request.url)

  try {
    const { accessToken, user } = await withAuth()

    if (!user || !accessToken) {
      return NextResponse.redirect(new URL('/login', baseUrl))
    }

    const memberships = await getLegacyOrganizationMemberships(accessToken)
    const organizationSlug = memberships[0]?.organization?.slug

    if (!organizationSlug) {
      return NextResponse.redirect(new URL('/login', baseUrl))
    }

    return NextResponse.redirect(new URL(`/${organizationSlug}`, baseUrl))
  } catch (error) {
    Sentry.captureException(error)

    return NextResponse.redirect(new URL('/login?error=auth-complete', baseUrl))
  }
}
