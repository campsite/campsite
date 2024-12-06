import { useEffect } from 'react'
import { app, nativeWindow } from '@todesktop/client-core'

import { useIsDesktopApp } from '@campsite/ui/hooks'
import { desktopJoinCall } from '@campsite/ui/Link'

export interface ToDesktopOpenProtocolUrlEvent {
  preventDefault: () => void
  url: string
}

export function DesktopProtocolUrlHandler() {
  const isDesktopApp = useIsDesktopApp()

  useEffect(() => {
    if (!isDesktopApp) return

    app.once('registerProtocolUrlListeners', (reset) => {
      // @ts-ignore
      // These types for app.on are incorrect in @todesktop/client-core
      // https://campsite-software.slack.com/archives/C04R260LUMV/p1722540732372669
      app.on('openProtocolURL', async (_eventName: string, e: ToDesktopOpenProtocolUrlEvent) => {
        if (e.url.includes('/calls/join/')) {
          e.preventDefault()
          await desktopJoinCall(e.url)

          // A bug in ToDesktop prevents us from focusing the new window.
          // Instead, we have to blur the current window to make the new window visible.
          // https://campsite-software.slack.com/archives/C04R260LUMV/p1719310578668499?thread_ts=1719279333.167369&cid=C04R260LUMV
          await nativeWindow.blur()
        }
      })

      window.addEventListener('unload', reset)
    })
  }, [isDesktopApp])

  return null
}
