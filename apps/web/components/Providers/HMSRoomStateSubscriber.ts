import { useEffect } from 'react'
import { selectRoomState, useHMSStore } from '@100mslive/react-sdk'
import { useSetAtom } from 'jotai'

import { callRoomStateAtom } from '@/atoms/call'

export function HMSRoomStateSubscriber() {
  const hmsRoomState = useHMSStore(selectRoomState)
  const setCallRoomState = useSetAtom(callRoomStateAtom)

  useEffect(() => {
    setCallRoomState(hmsRoomState)
  }, [hmsRoomState, setCallRoomState])

  return null
}
