import { useEffect, useState } from 'react'
import { Channel } from 'pusher-js'

import { Organization } from '@campsite/types'

import { usePusher } from '@/contexts/pusher'

export const useOrganizationChannel = (organization?: Organization) => {
  const [currentOrganizationChannel, setCurrentOrganizationChannel] = useState<Channel | null>(null)
  const pusher = usePusher()

  useEffect(() => {
    const channelName = organization?.channel_name

    if (!pusher || !channelName || currentOrganizationChannel) return

    setCurrentOrganizationChannel(pusher?.subscribe(channelName))

    return () => {
      if (!currentOrganizationChannel) return
      pusher.unsubscribe(channelName)
      setCurrentOrganizationChannel(null)
    }
  }, [currentOrganizationChannel, pusher, organization])

  return currentOrganizationChannel
}
