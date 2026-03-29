import {
  createLegacyCallRoom,
  createLegacyCallRoomInvitations,
  getLegacyCallRoom,
  getLegacyPersonalCallRoom,
  updateLegacyCallRoomRemoteRoomId
} from '@/lib/convex/callRooms'

export function getCallRoomsCompatClient(accessToken?: string | null) {
  return {
    getCallRoomById: (data: { slug: string; callRoomId: string }) => getLegacyCallRoom(accessToken, data),
    createCallRoom: (data: { slug: string; source: 'subject' | 'new_call_button' | 'cal_dot_com' }) =>
      createLegacyCallRoom(accessToken as string, data),
    getPersonalCallRoom: (data: { slug: string }) => getLegacyPersonalCallRoom(accessToken as string, data),
    createInvitations: (data: { slug: string; callRoomId: string; memberIds: string[] }) =>
      createLegacyCallRoomInvitations(accessToken as string, data),
    updateRemoteRoomId: (data: { callRoomId: string; remoteRoomId: string }) =>
      updateLegacyCallRoomRemoteRoomId(accessToken, data)
  }
}
