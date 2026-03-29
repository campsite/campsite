import { NextResponse } from 'next/server'

import { createHmsRoom, createHmsViewerToken } from '@/lib/calls/hmsCompat'
import { ensureWorkspace, getLegacyCurrentUser } from '@/lib/convex/server'
import { routeErrorResponse } from '@/lib/routeErrors'
import { getFreshRouteAuth } from '@/lib/routeSession'

import { getCallRoomsCompatClient } from '../_compat'

interface Context {
  params: Promise<{ orgSlug: string; callRoomId: string }>
}

export async function GET(_: Request, context: Context) {
  const { accessToken, user } = await getFreshRouteAuth()
  const { orgSlug, callRoomId } = await context.params
  const client = getCallRoomsCompatClient(accessToken)

  try {
    let callRoom = await client.getCallRoomById({
      slug: orgSlug,
      callRoomId
    })

    if (!callRoom.remote_room_id) {
      const remoteRoomId = await createHmsRoom()

      if (!remoteRoomId) {
        throw new Error('service_unavailable: Calls are not configured yet.')
      }

      await client.updateRemoteRoomId({
        callRoomId: callRoom.id,
        remoteRoomId
      })
      callRoom = {
        ...callRoom,
        remote_room_id: remoteRoomId
      }
    }

    let viewerToken = createHmsViewerToken({
      roomId: callRoom.remote_room_id,
      userId: null
    })

    if (accessToken && user) {
      await ensureWorkspace(accessToken, user)
      const currentUser = await getLegacyCurrentUser(accessToken)

      viewerToken = createHmsViewerToken({
        roomId: callRoom.remote_room_id,
        userId: currentUser.id
      })
    }

    if (!viewerToken) {
      throw new Error('service_unavailable: Calls are not configured yet.')
    }

    return NextResponse.json({
      ...callRoom,
      viewer_token: viewerToken
    })
  } catch (error) {
    return routeErrorResponse(error)
  }
}
