import { withAuth } from '@workos-inc/authkit-nextjs'
import { NextResponse } from 'next/server'

import { joinLegacyOrganizationByToken } from '@/lib/convex/onboarding'
import { ensureWorkspace } from '@/lib/convex/server'

export async function POST(_: Request, { params }: { params: { orgSlug: string; token: string } }) {
  const { accessToken, user } = await withAuth()

  if (!user || !accessToken) {
    return NextResponse.json({ code: 'unauthorized', message: 'Sign in required' }, { status: 401 })
  }

  await ensureWorkspace(accessToken, user)

  try {
    return NextResponse.json(
      await joinLegacyOrganizationByToken(accessToken, {
        slug: params.orgSlug,
        token: params.token
      }),
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      {
        code: 'unprocessable',
        message: error instanceof Error ? error.message : 'Organization could not be joined'
      },
      { status: 422 }
    )
  }
}
