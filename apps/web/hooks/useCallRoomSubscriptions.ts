import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { CallRoom } from '@campsite/types/generated'

import { useScope } from '@/contexts/scope'
import { useBindChannelEvent } from '@/hooks/useBindChannelEvent'
import { useCallRoomChannel } from '@/hooks/useCallRoomChannel'
import { apiClient } from '@/utils/queryClient'

type Options = {
  callRoom?: CallRoom
}

export function useCallRoomSubscriptions({ callRoom }: Options) {
  const { scope } = useScope()
  const queryClient = useQueryClient()
  const callRoomChannel = useCallRoomChannel(callRoom)

  const invalidateCallRoomQuery = useCallback(() => {
    if (!callRoom?.id) return

    queryClient.invalidateQueries({
      queryKey: apiClient.organizations.getCallRoomsById().requestKey(`${scope}`, callRoom.id)
    })
  }, [callRoom?.id, queryClient, scope])

  useBindChannelEvent(callRoomChannel, 'call-room-stale', invalidateCallRoomQuery)
}
