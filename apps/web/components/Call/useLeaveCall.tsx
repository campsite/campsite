import { useCallback } from 'react'
import { selectIsConnectedToRoom, useHMSActions, useHMSStore } from '@100mslive/react-sdk'
import { useSetAtom } from 'jotai'

import { callRoomStateAtom } from '@/atoms/call'

export function useLeaveCall() {
  const hmsActions = useHMSActions()
  const isConnected = useHMSStore(selectIsConnectedToRoom)
  const setCallRoomState = useSetAtom(callRoomStateAtom)

  return useCallback(async () => {
    if (!isConnected) return
    return await hmsActions.leave().then(() => setCallRoomState('Left'))
  }, [hmsActions, isConnected, setCallRoomState])
}
