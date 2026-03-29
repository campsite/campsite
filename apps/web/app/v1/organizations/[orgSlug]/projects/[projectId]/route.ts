import { withAuth } from '@workos-inc/authkit-nextjs'
import { NextResponse } from 'next/server'

import {
  deleteLegacyProject,
  getLegacyProject,
  updateLegacyProject
} from '@/lib/convex/onboarding'
import { ensureWorkspace } from '@/lib/convex/server'

export async function GET(_: Request, { params }: { params: { orgSlug: string; projectId: string } }) {
  const { accessToken, user } = await withAuth()

  if (!user || !accessToken) {
    return NextResponse.json({ code: 'unauthorized', message: 'Sign in required' }, { status: 401 })
  }

  await ensureWorkspace(accessToken, user)
  const project = await getLegacyProject(accessToken, {
    slug: params.orgSlug,
    projectId: params.projectId
  })

  if (!project) {
    return NextResponse.json({ code: 'not_found', message: 'Project not found' }, { status: 404 })
  }

  return NextResponse.json(project)
}

export async function PUT(request: Request, { params }: { params: { orgSlug: string; projectId: string } }) {
  const { accessToken, user } = await withAuth()

  if (!user || !accessToken) {
    return NextResponse.json({ code: 'unauthorized', message: 'Sign in required' }, { status: 401 })
  }

  const body = await request.json()

  await ensureWorkspace(accessToken, user)

  try {
    return NextResponse.json(
      await updateLegacyProject(accessToken, {
        slug: params.orgSlug,
        projectId: params.projectId,
        name: typeof body.name === 'string' ? body.name : undefined,
        description: typeof body.description === 'string' ? body.description : undefined,
        accessory: typeof body.accessory === 'string' ? body.accessory : undefined,
        cover_photo_path:
          typeof body.cover_photo_path === 'string' || body.cover_photo_path === null ? body.cover_photo_path : undefined,
        private: typeof body.private === 'boolean' ? body.private : undefined,
        is_default: typeof body.is_default === 'boolean' || body.is_default === null ? body.is_default : undefined
      })
    )
  } catch (error) {
    return NextResponse.json(
      {
        code: 'unprocessable',
        message: error instanceof Error ? error.message : 'Project could not be updated'
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
    await deleteLegacyProject(accessToken, {
      slug: params.orgSlug,
      projectId: params.projectId
    })

    return NextResponse.json({}, { status: 204 })
  } catch (error) {
    return NextResponse.json(
      {
        code: 'unprocessable',
        message: error instanceof Error ? error.message : 'Project could not be deleted'
      },
      { status: 422 }
    )
  }
}
