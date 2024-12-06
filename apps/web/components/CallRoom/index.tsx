import { useEffect, useRef } from 'react'
import { useAtom } from 'jotai'

import { callRoomStateAtom } from '@/atoms/call'
import { FullPageActiveCallContainer } from '@/components/Call/ActiveCall'
import { FullPageError } from '@/components/Error'
import { FullPageLoading } from '@/components/FullPageLoading'
import { useGetCallRoom } from '@/hooks/useGetCallRoom'
import { useGetCurrentUser } from '@/hooks/useGetCurrentUser'
import { useJoinCallRoom } from '@/hooks/useJoinCallRoom'

interface Props {
  callRoomId: string
}

export function CallRoom({ callRoomId }: Props) {
  const { data: currentUser } = useGetCurrentUser()
  const { joinRoom, isLoaded } = useJoinCallRoom({ callRoomId })
  const { data: callRoom, error } = useGetCallRoom({ callRoomId })
  const attemptedJoinRef = useRef(false)
  const [callRoomState, setCallRoomState] = useAtom(callRoomStateAtom)

  useEffect(() => {
    if (!isLoaded || attemptedJoinRef.current || !currentUser) return
    attemptedJoinRef.current = true

    if (!currentUser.logged_in) {
      setCallRoomState('Login')
      return
    }

    joinRoom()
  }, [callRoomState, currentUser, isLoaded, joinRoom, setCallRoomState])

  if (error) {
    return <FullPageError message={error.message} />
  }

  if (!callRoom) {
    return <FullPageLoading />
  }

  return <FullPageActiveCallContainer />
}
