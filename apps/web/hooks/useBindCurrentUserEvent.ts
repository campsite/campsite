import { useEffect } from 'react'

import { useCurrentUserChannel } from './useCurrentUserChannel'

type Options = {
  enabled?: boolean
}

export const useBindCurrentUserEvent = (eventName: string, callback: Function, options?: Options) => {
  const enabled = options?.enabled ?? true
  const { channel: currentUserChannel } = useCurrentUserChannel()

  useEffect(() => {
    if (!enabled || !currentUserChannel) return

    const wrapped = (evt: any) => callback(evt, eventName)

    currentUserChannel.bind(eventName, wrapped)

    return () => {
      currentUserChannel.unbind(eventName, wrapped)
    }
  }, [callback, currentUserChannel, enabled, eventName])
}
