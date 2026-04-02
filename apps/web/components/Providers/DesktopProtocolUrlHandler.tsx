import { useEffect } from 'react'

import { useIsDesktopApp } from '@campsite/ui/hooks'
import { desktopJoinCall } from '@campsite/ui/Link'

import { app, DesktopProtocolUrlEvent, nativeWindow } from '@/utils/electron-bridge'

// Re-export for backward compatibility until all consumers are migrated
export type { DesktopProtocolUrlEvent as ToDesktopOpenProtocolUrlEvent } from '@/utils/electron-bridge'

export function DesktopProtocolUrlHandler() {
  const isDesktopApp = useIsDesktopApp()

  useEffect(() => {
    if (!isDesktopApp) return

    app.once('registerProtocolUrlListeners', (reset) => {
      app.on('openProtocolURL', async (_eventName: string, e: DesktopProtocolUrlEvent) => {
        if (e.url.includes('/calls/join/')) {
          e.preventDefault()
          await desktopJoinCall(e.url)

          // A bug in ToDesktop prevents us from focusing the new window.
          // Instead, we have to blur the current window to make the new window visible.
          // https://campsite-software.slack.com/archives/C04R260LUMV/p1719310578668499?thread_ts=1719279333.167369&cid=C04R260LUMV
          await nativeWindow.blur()
        } else if (e.url.includes('://auth/desktop')) {
          e.preventDefault()

          const protocolUrl = new URL(e.url)
          const routePath = `/${protocolUrl.host}${protocolUrl.pathname}${protocolUrl.search}`

          window.location.assign(routePath)
        }
      })

      window.addEventListener('unload', reset)
    })
  }, [isDesktopApp])

  return null
}
