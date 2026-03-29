import { withAuth } from '@workos-inc/authkit-nextjs'
import { NextResponse } from 'next/server'

import { markLegacyProjectRead, markLegacyProjectUnread } from '@/lib/convex/onboarding'
import { ensureWorkspace } from '@/lib/convex/server'

export async function POST(_: Request, { params }: { params: { orgSlug: string; projectId: string } }) {
  const { accessToken, user } = await withAuth()

  if (!user || !accessToken) {
    return NextResponse.json({ code: 'unauthorized', message: 'Sign in required' }, { status: 401 })
  }

  await ensureWorkspace(accessToken, user)

  try {
    await markLegacyProjectRead(accessToken, {
      slug: params.orgSlug,
      projectId: params.projectId
    })

    return NextResponse.json({}, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      {
        code: 'unprocessable',
        message: error instanceof Error ? error.message : 'Project could not be marked read'
      },
      { status: 422 }
    )
  }
}

export async function DELETE(_: Request, { params }: { params: { orgSlug: string; projectId: string } }) {
  const { accessToken, user } = await withAuth()

  if (!user || !accessToken) {
    return NextResponse.json({ code: 'unauthorized', message: 'Sign in required' }, { status: 401 })
  }

  await ensureWorkspace(accessToken, user)

  try {
    await markLegacyProjectUnread(accessToken, {
      slug: params.orgSlug,
      projectId: params.projectId
    })

    return NextResponse.json({}, { status: 204 })
  } catch (error) {
    return NextResponse.json(
      {
        code: 'unprocessable',
        message: error instanceof Error ? error.message : 'Project could not be marked unread'
      },
      { status: 422 }
    )
  }
}
