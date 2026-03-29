import { withAuth } from '@workos-inc/authkit-nextjs'
import { NextResponse } from 'next/server'

import {
  deleteLegacyProjectViewerDisplayPreferences,
  updateLegacyProjectViewerDisplayPreferences
} from '@/lib/convex/onboarding'
import { ensureWorkspace } from '@/lib/convex/server'

export async function PUT(request: Request, { params }: { params: { orgSlug: string; projectId: string } }) {
  const { accessToken, user } = await withAuth()

  if (!user || !accessToken) {
    return NextResponse.json({ code: 'unauthorized', message: 'Sign in required' }, { status: 401 })
  }

  const body = await request.json()

  if (
    typeof body.display_reactions !== 'boolean' ||
    typeof body.display_attachments !== 'boolean' ||
    typeof body.display_comments !== 'boolean' ||
    typeof body.display_resolved !== 'boolean'
  ) {
    return NextResponse.json(
      { code: 'unprocessable', message: 'Viewer display preferences must be booleans' },
      { status: 422 }
    )
  }

  await ensureWorkspace(accessToken, user)

  try {
    return NextResponse.json(
      await updateLegacyProjectViewerDisplayPreferences(accessToken, {
        slug: params.orgSlug,
        projectId: params.projectId,
        display_reactions: body.display_reactions,
        display_attachments: body.display_attachments,
        display_comments: body.display_comments,
        display_resolved: body.display_resolved
      })
    )
  } catch (error) {
    return NextResponse.json(
      {
        code: 'unprocessable',
        message: error instanceof Error ? error.message : 'Viewer display preferences could not be updated'
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
    return NextResponse.json(
      await deleteLegacyProjectViewerDisplayPreferences(accessToken, {
        slug: params.orgSlug,
        projectId: params.projectId
      })
    )
  } catch (error) {
    return NextResponse.json(
      {
        code: 'unprocessable',
        message: error instanceof Error ? error.message : 'Viewer display preferences could not be deleted'
      },
      { status: 422 }
    )
  }
}
