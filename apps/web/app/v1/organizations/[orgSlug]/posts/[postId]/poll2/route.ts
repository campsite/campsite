import { withAuth } from '@workos-inc/authkit-nextjs'
import { NextResponse } from 'next/server'

import {
  createLegacyPostPoll,
  deleteLegacyPostPoll,
  ensureWorkspace,
  getLegacyOrganization,
  updateLegacyPostPoll
} from '@/lib/convex/server'

export async function POST(request: Request, { params }: { params: { orgSlug: string; postId: string } }) {
  const { accessToken, user } = await withAuth()

  if (!user || !accessToken) {
    return NextResponse.json({ code: 'unauthorized', message: 'Sign in required' }, { status: 401 })
  }

  await ensureWorkspace(accessToken, user)
  const organization = await getLegacyOrganization(accessToken, params.orgSlug)

  if (!organization) {
    return NextResponse.json({ code: 'not_found', message: 'Organization not found' }, { status: 404 })
  }

  const body = await request.json()

  try {
    return NextResponse.json(
      await createLegacyPostPoll(accessToken, {
        slug: params.orgSlug,
        postId: params.postId,
        description: typeof body.description === 'string' ? body.description : '',
        options: Array.isArray(body.options)
          ? body.options
              .filter((option: any) => option && typeof option.description === 'string')
              .map((option: any) => ({ description: option.description }))
          : []
      })
    )
  } catch (error) {
    return NextResponse.json(
      {
        code: 'invalid_poll',
        message: error instanceof Error ? error.message : 'Poll could not be created'
      },
      { status: 400 }
    )
  }
}

export async function PUT(request: Request, { params }: { params: { orgSlug: string; postId: string } }) {
  const { accessToken, user } = await withAuth()

  if (!user || !accessToken) {
    return NextResponse.json({ code: 'unauthorized', message: 'Sign in required' }, { status: 401 })
  }

  await ensureWorkspace(accessToken, user)
  const organization = await getLegacyOrganization(accessToken, params.orgSlug)

  if (!organization) {
    return NextResponse.json({ code: 'not_found', message: 'Organization not found' }, { status: 404 })
  }

  const body = await request.json()

  try {
    return NextResponse.json(
      await updateLegacyPostPoll(accessToken, {
        slug: params.orgSlug,
        postId: params.postId,
        description: typeof body.description === 'string' ? body.description : '',
        options: Array.isArray(body.options)
          ? body.options
              .filter((option: any) => option && typeof option.description === 'string')
              .map((option: any) => ({
                id: typeof option.id === 'string' ? option.id : undefined,
                description: option.description
              }))
          : []
      })
    )
  } catch (error) {
    return NextResponse.json(
      {
        code: 'invalid_poll',
        message: error instanceof Error ? error.message : 'Poll could not be updated'
      },
      { status: 400 }
    )
  }
}

export async function DELETE(_: Request, { params }: { params: { orgSlug: string; postId: string } }) {
  const { accessToken, user } = await withAuth()

  if (!user || !accessToken) {
    return NextResponse.json({ code: 'unauthorized', message: 'Sign in required' }, { status: 401 })
  }

  await ensureWorkspace(accessToken, user)
  const organization = await getLegacyOrganization(accessToken, params.orgSlug)

  if (!organization) {
    return NextResponse.json({ code: 'not_found', message: 'Organization not found' }, { status: 404 })
  }

  try {
    return NextResponse.json(
      await deleteLegacyPostPoll(accessToken, {
        slug: params.orgSlug,
        postId: params.postId
      })
    )
  } catch (error) {
    return NextResponse.json(
      {
        code: 'invalid_poll',
        message: error instanceof Error ? error.message : 'Poll could not be deleted'
      },
      { status: 400 }
    )
  }
}
