import { useEffect, useState } from 'react'
import { Channel } from 'pusher-js'

import { CallRoom } from '@campsite/types'

import { usePusher } from '@/contexts/pusher'

export const useCallRoomChannel = (callRoom: CallRoom | undefined) => {
  const [currentCallRoomChannel, setCurrentCallRoomChannel] = useState<Channel | null>(null)
  const pusher = usePusher()

  useEffect(() => {
    const channelName = callRoom?.channel_name

    if (!pusher || !channelName || currentCallRoomChannel) return

    setCurrentCallRoomChannel(pusher?.subscribe(channelName))

    return () => {
      if (!currentCallRoomChannel) return
      pusher.unsubscribe(channelName)
      setCurrentCallRoomChannel(null)
    }
  }, [currentCallRoomChannel, pusher, callRoom])

  return currentCallRoomChannel
}
