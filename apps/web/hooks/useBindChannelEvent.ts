import { useEffect } from 'react'
import { Channel } from 'pusher-js'

export const useBindChannelEvent = (channel: Channel | null, eventName: string, callback: Function) => {
  useEffect(() => {
    if (!channel) return

    channel.bind(eventName, callback)

    return () => {
      channel.unbind(eventName, callback)
    }
  }, [callback, channel, eventName])
}
