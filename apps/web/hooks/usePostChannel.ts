import { useEffect, useState } from 'react'
import { Channel } from 'pusher-js'

import { Post } from '@campsite/types'

import { usePusher } from '@/contexts/pusher'

export const usePostChannel = (post: Post | undefined) => {
  const [currentPostChannel, setCurrentPostChannel] = useState<Channel | null>(null)
  const pusher = usePusher()

  useEffect(() => {
    const channelName = post?.channel_name

    if (!pusher || !channelName || currentPostChannel) return

    setCurrentPostChannel(pusher?.subscribe(channelName))

    return () => {
      if (!currentPostChannel) return
      pusher.unsubscribe(channelName)
      setCurrentPostChannel(null)
    }
  }, [currentPostChannel, pusher, post])

  return currentPostChannel
}
