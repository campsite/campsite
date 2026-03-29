import { withAuth } from '@workos-inc/authkit-nextjs'
import { NextResponse } from 'next/server'

import { ensureWorkspace, getLegacyCurrentUser, getLegacyOrganization } from '@/lib/convex/server'
import { buildPusherAuthPayload, isPusherConfigured } from '@/lib/realtime/pusherCompat'

function extractChannelName(channelName: string) {
  if (channelName.startsWith('presence-org-')) {
    return { kind: 'organization' as const, slug: channelName.replace(/^presence-org-/, '') }
  }

  if (channelName.startsWith('presence-organization-')) {
    return { kind: 'organization' as const, slug: channelName.replace(/^presence-organization-/, '') }
  }

  if (channelName.startsWith('presence-note-')) {
    return { kind: 'note' as const }
  }

  if (channelName.startsWith('private-thread-')) {
    return { kind: 'thread' as const }
  }

  if (channelName.startsWith('private-user-')) {
    return { kind: 'user' as const }
  }

  if (channelName.startsWith('private-figma-')) {
    return { kind: 'figma' as const }
  }

  return { kind: 'unknown' as const }
}

async function parseBody(request: Request) {
  try {
    const form = await request.formData()

    return {
      channelName: String(form.get('channel_name') || ''),
      socketId: String(form.get('socket_id') || '')
    }
  } catch {
    const search = new URLSearchParams(await request.text())

    return {
      channelName: search.get('channel_name') || '',
      socketId: search.get('socket_id') || ''
    }
  }
}

export async function POST(request: Request) {
  const { channelName, socketId } = await parseBody(request)

  if (!channelName || !socketId) {
    return NextResponse.json({ code: 'invalid_request', message: 'channel_name and socket_id are required.' }, { status: 400 })
  }

  if (!isPusherConfigured()) {
    return NextResponse.json(
      { code: 'realtime_unavailable', message: 'Realtime auth is not configured.' },
      { status: 503 }
    )
  }

  const descriptor = extractChannelName(channelName)

  if (descriptor.kind === 'figma') {
    return NextResponse.json(buildPusherAuthPayload({ channelName, socketId }))
  }

  const { accessToken, user } = await withAuth()

  if (!accessToken || !user) {
    return NextResponse.json({ code: 'forbidden', message: 'You are not allowed to access this channel.' }, { status: 403 })
  }

  await ensureWorkspace(accessToken, user)

  const currentUser = await getLegacyCurrentUser(accessToken)

  if (descriptor.kind === 'user' && currentUser.channel_name !== channelName) {
    return NextResponse.json({ code: 'forbidden', message: 'You are not allowed to access this channel.' }, { status: 403 })
  }

  if (descriptor.kind === 'organization') {
    const organization = await getLegacyOrganization(accessToken, descriptor.slug)

    if (!organization) {
      return NextResponse.json({ code: 'forbidden', message: 'You are not allowed to access this channel.' }, { status: 403 })
    }
  }

  if (descriptor.kind === 'unknown') {
    return NextResponse.json({ code: 'forbidden', message: 'You are not allowed to access this channel.' }, { status: 403 })
  }

  return NextResponse.json(
    buildPusherAuthPayload({
      channelName,
      socketId,
      userId: currentUser.id,
      userName: currentUser.display_name
    })
  )
}
