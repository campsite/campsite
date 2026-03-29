import { NextResponse } from 'next/server'

import { createHmsRoom, createHmsViewerToken } from '@/lib/calls/hmsCompat'
import { getLegacyCurrentUser } from '@/lib/convex/server'
import { routeErrorResponse } from '@/lib/routeErrors'
import { getRouteAccess, routeUnauthorizedResponse } from '@/lib/routeSession'

import { getCallRoomsCompatClient } from '../../../call_rooms/_compat'

interface Context {
  params: Promise<{ orgSlug: string }>
}

export async function GET(_: Request, context: Context) {
  const auth = await getRouteAccess()
  const { orgSlug } = await context.params

  if (!auth) {
    return routeUnauthorizedResponse()
  }

  const client = getCallRoomsCompatClient(auth.accessToken)

  try {
    let callRoom = await client.getPersonalCallRoom({
      slug: orgSlug
    })

    if (!callRoom.remote_room_id) {
      const remoteRoomId = await createHmsRoom().catch(() => null)

      if (remoteRoomId) {
        await client.updateRemoteRoomId({
          callRoomId: callRoom.id,
          remoteRoomId
        })
        callRoom = {
          ...callRoom,
          remote_room_id: remoteRoomId
        }
      }
    }

    const currentUser = await getLegacyCurrentUser(auth.accessToken)

    return NextResponse.json({
      ...callRoom,
      viewer_token: createHmsViewerToken({ roomId: callRoom.remote_room_id, userId: currentUser.id })
    })
  } catch (error) {
    return routeErrorResponse(error)
  }
}
