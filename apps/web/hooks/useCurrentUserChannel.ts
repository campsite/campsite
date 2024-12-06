import { useEffect, useState } from 'react'
import { Channel } from 'pusher-js'

import { usePusher } from '@/contexts/pusher'

import { useGetCurrentUser } from './useGetCurrentUser'

export const useCurrentUserChannel = () => {
  const { data: currentUser } = useGetCurrentUser()
  const pusher = usePusher()
  const [channel, setChannel] = useState<Channel | null>(null)

  useEffect(() => {
    const channelName = currentUser?.channel_name

    if (!pusher || !channelName || channel) return

    setChannel(pusher.subscribe(channelName))

    return () => {
      if (!channel) return
      pusher.unsubscribe(channelName)
      setChannel(null)
    }
  }, [channel, currentUser?.channel_name, pusher])

  return { channel }
}
