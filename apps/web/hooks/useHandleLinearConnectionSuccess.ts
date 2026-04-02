import { useEffect } from 'react'
import { app } from '@/utils/electron-bridge'

import { useIsDesktopApp } from '@campsite/ui/src/hooks'

import { ToDesktopOpenProtocolUrlEvent } from '@/components/Providers/DesktopProtocolUrlHandler'
import { linearConnectionSuccessPath } from '@/hooks/useLinearAuthorizationUrl'
import { linearConnectionSuccessMessage } from '@/pages/linear-connection-success'

export function useHandleLinearConnectionSuccess(callback: () => void) {
  const isDesktopApp = useIsDesktopApp()

  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      if (e.data === linearConnectionSuccessMessage) callback()
    }

    window.addEventListener('message', handleMessage)

    if (isDesktopApp) {
      app.on('openProtocolURL', (_eventName: string, e: ToDesktopOpenProtocolUrlEvent) => {
        if (e.url.includes(linearConnectionSuccessPath)) {
          e.preventDefault()
          callback()
        }
      })
    }

    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [callback, isDesktopApp])
}
