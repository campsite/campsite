import { useEffect, useState } from 'react'
import { Channel } from 'pusher-js'

import { usePusher } from '@/contexts/pusher'

export const useChannel = (channelName: string | undefined) => {
  const [channel, setChannel] = useState<Channel | null>(null)
  const pusher = usePusher()

  useEffect(() => {
    if (!pusher || !channelName) return

    const newChannel = pusher?.subscribe(channelName)

    setChannel(newChannel)

    return () => {
      pusher.unsubscribe(channelName)
    }
  }, [channelName, pusher])

  return channel
}
