import { withAuth } from '@workos-inc/authkit-nextjs'
import { NextResponse } from 'next/server'

import { createHmsRoom, createHmsViewerToken } from '@/lib/calls/hmsCompat'
import { ensureWorkspace, getLegacyCurrentUser } from '@/lib/convex/server'
import { routeErrorResponse } from '@/lib/routeErrors'

import { getCallRoomsCompatClient } from '../_compat'

interface Context {
  params: Promise<{ orgSlug: string; callRoomId: string }>
}

export async function GET(_: Request, context: Context) {
  const { accessToken, user } = await withAuth()
  const { orgSlug, callRoomId } = await context.params
  const client = getCallRoomsCompatClient(accessToken)

  try {
    let callRoom = await client.getCallRoomById({
      slug: orgSlug,
      callRoomId
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

    return NextResponse.json({
      ...callRoom,
      viewer_token: viewerToken
    })
  } catch (error) {
    return routeErrorResponse(error)
  }
}
