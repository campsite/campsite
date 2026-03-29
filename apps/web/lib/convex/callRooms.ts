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

async function callRoomFunction<T>(accessToken: string | null | undefined, name: string, args: Record<string, unknown>) {
  const client = getConvexServerClient(accessToken)

  return (await (client as any).function(name, undefined, args)) as T
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
  return normalizeLegacyCallRoom(await callRoomFunction<CompatCallRoom>(accessToken, 'callRooms:getLegacyCallRoomById', data))
}

export async function createLegacyCallRoom(
  accessToken: string,
  data: { slug: string; source: 'subject' | 'new_call_button' | 'cal_dot_com' }
) {
  return normalizeLegacyCallRoom(await callRoomFunction<CompatCallRoom>(accessToken, 'callRooms:createLegacyCallRoom', data))
}

export async function getLegacyPersonalCallRoom(accessToken: string, data: { slug: string }) {
  return normalizeLegacyCallRoom(
    await callRoomFunction<CompatCallRoom>(accessToken, 'callRooms:getOrCreateLegacyPersonalCallRoom', data)
  )
}

export async function createLegacyCallRoomInvitations(
  accessToken: string,
  data: { slug: string; callRoomId: string; memberIds: string[] }
) {
  return await callRoomFunction<object>(accessToken, 'callRooms:createLegacyCallRoomInvitations', data)
}

export async function updateLegacyCallRoomRemoteRoomId(
  accessToken: string | null | undefined,
  data: { callRoomId: string; remoteRoomId: string }
) {
  return await callRoomFunction(accessToken, 'callRooms:updateLegacyCallRoomRemoteRoomId', data)
}
