import { useEffect } from 'react'
import { app } from '@todesktop/client-core'

import { useIsDesktopApp } from '@campsite/ui/hooks'

import { useCurrentUserChannel } from '@/hooks/useCurrentUserChannel'

type Options = {
  onceId: string
  eventName: string
  callback: Function
}

export function useBindCurrentUserEventOnceInDesktopApp({ onceId, eventName, callback }: Options) {
  const isDesktop = useIsDesktopApp()
  const { channel: currentUserChannel } = useCurrentUserChannel()

  useEffect(() => {
    if (!isDesktop || !currentUserChannel) return

    app.once(onceId, (reset) => {
      currentUserChannel.bind(eventName, callback)

      window.addEventListener('unload', () => {
        currentUserChannel.unbind(eventName, callback)
        reset()
      })
    })
  }, [callback, currentUserChannel, eventName, isDesktop, onceId])
}
