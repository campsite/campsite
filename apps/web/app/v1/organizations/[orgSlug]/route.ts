import { withAuth } from '@workos-inc/authkit-nextjs'
import { NextResponse } from 'next/server'

import { normalizeLegacyOrganization } from '@/lib/convex/compat'
import { deleteLegacyOrganization, updateLegacyOrganization } from '@/lib/convex/organization'
import { ensureWorkspace, getLegacyOrganization } from '@/lib/convex/server'
import { routeErrorResponse } from '@/lib/routeErrors'

export async function GET(_: Request, { params }: { params: { orgSlug: string } }) {
  const { accessToken, user } = await withAuth()

  if (!user || !accessToken) {
    return NextResponse.json({ code: 'unauthorized', message: 'Sign in required' }, { status: 401 })
  }

  await ensureWorkspace(accessToken, user)
  const organization = await getLegacyOrganization(accessToken, params.orgSlug)

  if (!organization) {
    return NextResponse.json({ code: 'not_found', message: 'Organization not found' }, { status: 404 })
  }

  return NextResponse.json(normalizeLegacyOrganization(organization))
}

export async function PUT(request: Request, { params }: { params: { orgSlug: string } }) {
  const { accessToken, user } = await withAuth()

  if (!user || !accessToken) {
    return NextResponse.json({ code: 'unauthorized', message: 'Sign in required' }, { status: 401 })
  }

  try {
    const body = await request.json()

    await ensureWorkspace(accessToken, user)
    const organization = await updateLegacyOrganization(accessToken, {
      slug: params.orgSlug,
      name: typeof body.name === 'string' ? body.name : undefined,
      nextSlug: typeof body.slug === 'string' ? body.slug : undefined,
      avatarPath: body.avatar_path ?? undefined,
      billingEmail: body.billing_email ?? undefined,
      emailDomain: body.email_domain ?? undefined,
      slackChannelId: body.slack_channel_id ?? undefined,
      slackChannelIsPrivate: body.slack_channel_is_private ?? undefined
    })

    return NextResponse.json(normalizeLegacyOrganization(organization))
  } catch (error) {
    return routeErrorResponse(error)
  }
}

export async function DELETE(_: Request, { params }: { params: { orgSlug: string } }) {
  const { accessToken, user } = await withAuth()

  if (!user || !accessToken) {
    return NextResponse.json({ code: 'unauthorized', message: 'Sign in required' }, { status: 401 })
  }

  try {
    await ensureWorkspace(accessToken, user)
    await deleteLegacyOrganization(accessToken, { slug: params.orgSlug })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    return routeErrorResponse(error)
  }
}
