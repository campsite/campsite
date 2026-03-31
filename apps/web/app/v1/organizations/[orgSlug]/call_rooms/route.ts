import { NextResponse } from 'next/server'

import { createHmsRoom, createHmsViewerToken } from '@/lib/calls/hmsCompat'
import { getLegacyCurrentUser } from '@/lib/convex/server'
import { routeErrorResponse } from '@/lib/routeErrors'
import { getRouteAccess, routeUnauthorizedResponse } from '@/lib/routeSession'

import { getCallRoomsCompatClient } from './_compat'

interface Context {
  params: Promise<{ orgSlug: string }>
}

export async function POST(request: Request, context: Context) {
  const auth = await getRouteAccess()
  const { orgSlug } = await context.params

  if (!auth) {
    return routeUnauthorizedResponse()
  }

  const body = (await request.json().catch(() => null)) as { source?: 'subject' | 'new_call_button' | 'cal_dot_com' } | null
  const source = body?.source === 'subject' || body?.source === 'cal_dot_com' ? body.source : 'new_call_button'
  const client = getCallRoomsCompatClient(auth.accessToken)

  try {
    // Kick off user fetch immediately in parallel with room creation
    const [callRoom, currentUser] = await Promise.all([
      client.createCallRoom({ slug: orgSlug, source }),
      getLegacyCurrentUser(auth.accessToken)
    ])

    let remoteRoomId = callRoom.remote_room_id

    if (!remoteRoomId) {
      remoteRoomId = await createHmsRoom()

      if (!remoteRoomId) {
        throw new Error('service_unavailable: Calls are not configured yet.')
      }

      // Fire and forget — don't block the response on persisting the room ID
      client.updateRemoteRoomId({ callRoomId: callRoom.id, remoteRoomId }).catch(() => undefined)
    }

    const viewerToken = createHmsViewerToken({ roomId: remoteRoomId, userId: currentUser.id })

    if (!viewerToken) {
      throw new Error('service_unavailable: Calls are not configured yet.')
    }

    return NextResponse.json({
      ...callRoom,
      remote_room_id: remoteRoomId,
      viewer_token: viewerToken
    })
  } catch (error) {
    return routeErrorResponse(error)
  }
}
