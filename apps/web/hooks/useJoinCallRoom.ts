import { useCallback, useRef } from 'react'
import { selectIsConnectedToRoom, useHMSActions, useHMSStore } from '@100mslive/react-sdk'
import { useSetAtom } from 'jotai'

import { joinCallAtom } from '@/atoms/call'
import { useCurrentUserChannel } from '@/hooks/useCurrentUserChannel'
import { useGetCallRoom } from '@/hooks/useGetCallRoom'
import { useGetCurrentUser } from '@/hooks/useGetCurrentUser'

interface Props {
  callRoomId: string
}

interface JoinRoomOptions {
  name: string
}

export function useJoinCallRoom({ callRoomId }: Props) {
  const { data: callRoom } = useGetCallRoom({ callRoomId: callRoomId })
  const setJoinCall = useSetAtom(joinCallAtom)
  const hmsActions = useHMSActions()
  const { data: currentUser } = useGetCurrentUser()
  const attemptingJoinRef = useRef(false)
  const isConnected = useHMSStore(selectIsConnectedToRoom)
  const { channel: currentUserChannel } = useCurrentUserChannel()

  const isLoaded = !!callRoom?.viewer_token && !!currentUser

  const joinRoom = useCallback(
    (options?: JoinRoomOptions) => {
      if (!isLoaded || attemptingJoinRef.current) return
      attemptingJoinRef.current = true

      const join = () => {
        if (!callRoom.viewer_token) return
        const userName = options?.name || currentUser.display_name

        setJoinCall({ title: callRoom.title })
        hmsActions
          .join({
            userName,
            authToken: callRoom.viewer_token,
            rememberDeviceSelection: true,
            settings: { isVideoMuted: true, speakerAutoSelectionBlacklist: 'all' }
          })
          .then(() => {
            attemptingJoinRef.current = false
            currentUserChannel?.trigger('client-joined-call', { call_room_id: callRoom.id })
          })
      }

      if (isConnected) {
        hmsActions.leave().then(join)
      } else {
        join()
      }
    },
    [
      callRoom?.id,
      callRoom?.title,
      callRoom?.viewer_token,
      currentUser?.display_name,
      currentUserChannel,
      hmsActions,
      isConnected,
      isLoaded,
      setJoinCall
    ]
  )

  return { joinRoom, isLoaded }
}
