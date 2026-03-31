import { NextResponse } from 'next/server'

import { createLegacyThreadMessage } from '@/lib/convex/threads'
import { triggerPusherEvents } from '@/lib/realtime/pusherTrigger'
import { routeErrorResponse } from '@/lib/routeErrors'
import { getRouteAccess, routeUnauthorizedResponse } from '@/lib/routeSession'
import { WEB_URL } from '@campsite/config'

import { getCallRoomsCompatClient } from '../../_compat'

interface Context {
  params: Promise<{ orgSlug: string; callRoomId: string }>
}

export async function POST(request: Request, context: Context) {
  const auth = await getRouteAccess()
  const { orgSlug, callRoomId } = await context.params

  if (!auth) {
    return routeUnauthorizedResponse()
  }

  const body = (await request.json().catch(() => null)) as { member_ids?: string[]; thread_ids?: string[] } | null

  if (!body?.member_ids || !Array.isArray(body.member_ids)) {
    return NextResponse.json({ code: 'invalid_request', message: 'member_ids is required.' }, { status: 400 })
  }

  const client = getCallRoomsCompatClient(auth.accessToken)

  try {
    const result = await client.createInvitations({
      slug: orgSlug,
      callRoomId,
      memberIds: body.member_ids
    }) as {
      invitedUserIds?: string[]
      callRoom?: any
      creatorMember?: any
    }

    if (result.invitedUserIds?.length && result.creatorMember) {
      const events = result.invitedUserIds.map((userId) => ({
        channel: `private-user-${userId}`,
        event: 'incoming-call-room-invitation',
        data: {
          call_room_id: callRoomId,
          call_room_url: result.callRoom?.url ?? `/${orgSlug}/calls/join/${callRoomId}`,
          creator_member: result.creatorMember,
          other_active_peers: result.callRoom?.active_peers ?? [],
          skip_push: false
        }
      }))

      await triggerPusherEvents(events).catch(() => undefined)
    }

    // Post join message to any selected group threads
    const threadIds = Array.isArray(body.thread_ids) ? body.thread_ids : []
    const joinUrl = `${WEB_URL}/${orgSlug}/calls/join/${callRoomId}`

    await Promise.all(
      threadIds.map((threadId) =>
        createLegacyThreadMessage(auth.accessToken, {
          slug: orgSlug,
          threadId,
          content: `<p><a href="${joinUrl}">${joinUrl}</a></p>`,
          attachments: []
        }).catch(() => undefined)
      )
    )

    return NextResponse.json({})
  } catch (error) {
    return routeErrorResponse(error)
  }
}
