import { withAuth } from '@workos-inc/authkit-nextjs'
import { NextResponse } from 'next/server'

import {
  createLegacyProject,
  getLegacyProjectsPage
} from '@/lib/convex/onboarding'
import { ensureWorkspace } from '@/lib/convex/server'

export async function GET(request: Request, { params }: { params: { orgSlug: string } }) {
  const { accessToken, user } = await withAuth()

  if (!user || !accessToken) {
    return NextResponse.json({ code: 'unauthorized', message: 'Sign in required' }, { status: 401 })
  }

  const searchParams = new URL(request.url).searchParams

  await ensureWorkspace(accessToken, user)

  return NextResponse.json(
    await getLegacyProjectsPage(accessToken, {
      slug: params.orgSlug,
      q: searchParams.get('q') || undefined,
      filter: searchParams.get('filter') || undefined,
      after: searchParams.get('after') || undefined,
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined
    })
  )
}

export async function POST(request: Request, { params }: { params: { orgSlug: string } }) {
  const { accessToken, user } = await withAuth()

  if (!user || !accessToken) {
    return NextResponse.json({ code: 'unauthorized', message: 'Sign in required' }, { status: 401 })
  }

  const body = await request.json()

  await ensureWorkspace(accessToken, user)

  try {
    return NextResponse.json(
      await createLegacyProject(accessToken, {
        slug: params.orgSlug,
        name: typeof body.name === 'string' ? body.name : '',
        description: typeof body.description === 'string' ? body.description : undefined,
        accessory: typeof body.accessory === 'string' ? body.accessory : undefined,
        cover_photo_path: typeof body.cover_photo_path === 'string' ? body.cover_photo_path : undefined,
        private: body.private === true,
        is_default: typeof body.is_default === 'boolean' ? body.is_default : undefined,
        onboarding: typeof body.onboarding === 'boolean' ? body.onboarding : undefined
      }),
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json(
      {
        code: 'unprocessable',
        message: error instanceof Error ? error.message : 'Project could not be created'
      },
      { status: 422 }
    )
  }
}
