import { withAuth } from '@workos-inc/authkit-nextjs'
import { NextResponse } from 'next/server'

import { createLegacyProjectView } from '@/lib/convex/onboarding'
import { ensureWorkspace } from '@/lib/convex/server'

export async function POST(_: Request, { params }: { params: { orgSlug: string; projectId: string } }) {
  const { accessToken, user } = await withAuth()

  if (!user || !accessToken) {
    return NextResponse.json({ code: 'unauthorized', message: 'Sign in required' }, { status: 401 })
  }

  await ensureWorkspace(accessToken, user)

  try {
    return NextResponse.json(
      await createLegacyProjectView(accessToken, {
        slug: params.orgSlug,
        projectId: params.projectId
      }),
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json(
      {
        code: 'unprocessable',
        message: error instanceof Error ? error.message : 'Project view could not be created'
      },
      { status: 422 }
    )
  }
}
