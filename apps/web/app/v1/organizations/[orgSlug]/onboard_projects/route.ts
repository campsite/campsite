import { withAuth } from '@workos-inc/authkit-nextjs'
import { NextResponse } from 'next/server'

import { createLegacyOnboardProjects } from '@/lib/convex/onboarding'
import { ensureWorkspace } from '@/lib/convex/server'

export async function POST(request: Request, { params }: { params: { orgSlug: string } }) {
  const { accessToken, user } = await withAuth()

  if (!user || !accessToken) {
    return NextResponse.json({ code: 'unauthorized', message: 'Sign in required' }, { status: 401 })
  }

  const body = await request.json()

  await ensureWorkspace(accessToken, user)

  try {
    await createLegacyOnboardProjects(accessToken, {
      slug: params.orgSlug,
      general_name: typeof body.general_name === 'string' ? body.general_name : 'General',
      general_accessory: typeof body.general_accessory === 'string' ? body.general_accessory : undefined,
      projects: Array.isArray(body.projects) ? body.projects : []
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    return NextResponse.json(
      {
        code: 'unprocessable',
        message: error instanceof Error ? error.message : 'Onboarding projects could not be created'
      },
      { status: 422 }
    )
  }
}
