import { withAuth } from '@workos-inc/authkit-nextjs'
import { NextResponse } from 'next/server'

import {
  deleteLegacyViewerStatus,
  getLegacyViewerStatuses,
  upsertLegacyViewerStatus
} from '@/lib/convex/notifications'
import { ensureWorkspace } from '@/lib/convex/server'

interface Context {
  params: Promise<{ orgSlug: string }>
}

function parseExpiresAt(value?: string | null) {
  return value ? new Date(value).getTime() : null
}

export async function GET(_request: Request, context: Context) {
  const { accessToken, user } = await withAuth()
  const { orgSlug } = await context.params

  if (!user || !accessToken) {
    return NextResponse.json([])
  }

  await ensureWorkspace(accessToken, user)

  return NextResponse.json(await getLegacyViewerStatuses(accessToken, orgSlug))
}

export async function POST(request: Request, context: Context) {
  const { accessToken, user } = await withAuth()
  const { orgSlug } = await context.params

  if (!user || !accessToken) {
    return NextResponse.json({ code: 'unauthorized', message: 'Sign in required' }, { status: 401 })
  }

  const body = await request.json()

  await ensureWorkspace(accessToken, user)

  return NextResponse.json(
    await upsertLegacyViewerStatus(accessToken, {
      slug: orgSlug,
      emoji: body.emoji,
      message: body.message,
      expirationSetting: body.expiration_setting,
      expiresAt: parseExpiresAt(body.expires_at),
      pauseNotifications: body.pause_notifications
    })
  )
}

export async function PUT(request: Request, context: Context) {
  return POST(request, context)
}

export async function DELETE(_request: Request, context: Context) {
  const { accessToken, user } = await withAuth()
  const { orgSlug } = await context.params

  if (!user || !accessToken) {
    return NextResponse.json({ code: 'unauthorized', message: 'Sign in required' }, { status: 401 })
  }

  await ensureWorkspace(accessToken, user)
  await deleteLegacyViewerStatus(accessToken, orgSlug)

  return NextResponse.json({})
}
