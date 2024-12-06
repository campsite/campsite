import { HMSRoomState } from '@100mslive/react-sdk'
import { atom } from 'jotai'

import { CallPeer, OrganizationMember } from '@campsite/types'

export const titleAtom = atom<string | null>(null)
export const incomingCallRoomInvitationAtom = atom<CallRoomInvitation | undefined>(undefined)
export const callRoomStateAtom = atom<CallRoomState>(HMSRoomState.Disconnected)
export const callChatOpenAtom = atom(false)

export type CallRoomInvitation = {
  call_room_id: string
  call_room_url: string
  creator_member: OrganizationMember
  other_active_peers: CallPeer[]
  skip_push: boolean
}

type CallRoomState = HMSRoomState | 'Login' | 'Left'

export const joinCallAtom = atom(null, (_get, set, payload: { title: string | null }) => {
  set(titleAtom, payload.title)
  set(incomingCallRoomInvitationAtom, undefined)
})
