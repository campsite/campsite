import { useEffect, useState } from 'react'
import { Channel } from 'pusher-js'

import { Call } from '@campsite/types'

import { usePusher } from '@/contexts/pusher'

export const useCallChannel = (call: Call | undefined) => {
  const [currentCallChannel, setCurrentCallChannel] = useState<Channel | null>(null)
  const pusher = usePusher()

  useEffect(() => {
    const channelName = call?.channel_name

    if (!pusher || !channelName || currentCallChannel) return

    setCurrentCallChannel(pusher?.subscribe(channelName))

    return () => {
      if (!currentCallChannel) return
      pusher.unsubscribe(channelName)
      setCurrentCallChannel(null)
    }
  }, [currentCallChannel, pusher, call])

  return currentCallChannel
}
