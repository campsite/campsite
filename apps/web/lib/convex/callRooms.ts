import { api } from '@/convex/_generated/api'

import { toAbsoluteWebUrl } from './compat'
import { getConvexServerClient } from './server'

export interface CompatCallRoom {
  id: string
  channel_name: string
  url: string
  title: string | null
  viewer_token: string | null
  viewer_can_invite_participants: boolean
  active_peers: any[]
  peers: any[]
  remote_room_id?: string | null
}

export function normalizeLegacyCallRoom<T extends CompatCallRoom>(callRoom: T): T {
  return {
    ...callRoom,
    url: toAbsoluteWebUrl(callRoom.url)
  }
}

export async function getLegacyCallRoom(
  accessToken: string | null | undefined,
  data: { slug: string; callRoomId: string }
) {
  const client = getConvexServerClient(accessToken)

  return normalizeLegacyCallRoom(
    await client.query(api.callRooms.getLegacyCallRoomById, data) as CompatCallRoom
  )
}

export async function createLegacyCallRoom(
  accessToken: string,
  data: { slug: string; source: 'subject' | 'new_call_button' | 'cal_dot_com' }
) {
  const client = getConvexServerClient(accessToken)

  return normalizeLegacyCallRoom(
    await client.mutation(api.callRooms.createLegacyCallRoom, data) as CompatCallRoom
  )
}

export async function getLegacyPersonalCallRoom(accessToken: string, data: { slug: string }) {
  const client = getConvexServerClient(accessToken)

  return normalizeLegacyCallRoom(
    await client.mutation(api.callRooms.getOrCreateLegacyPersonalCallRoom, data) as CompatCallRoom
  )
}

export async function createLegacyCallRoomInvitations(
  accessToken: string,
  data: { slug: string; callRoomId: string; memberIds: string[] }
) {
  const client = getConvexServerClient(accessToken)

  return await client.mutation(api.callRooms.createLegacyCallRoomInvitations, data) as object
}

export async function updateLegacyCallRoomRemoteRoomId(
  accessToken: string | null | undefined,
  data: { callRoomId: string; remoteRoomId: string }
) {
  const client = getConvexServerClient(accessToken)

  return await client.mutation(api.callRooms.updateLegacyCallRoomRemoteRoomId, data)
}
