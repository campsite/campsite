import { useEffect } from 'react'
import { app } from '@/utils/electron-bridge'

import { useIsDesktopApp } from '@campsite/ui/src/hooks'

import { ToDesktopOpenProtocolUrlEvent } from '@/components/Providers/DesktopProtocolUrlHandler'
import { figmaConnectionSuccessMessage } from '@/pages/figma-connection-success'

import { figmaConnectionSuccessPath } from './useFigmaAuthorizationUrl'

export function useHandleFigmaConnectionSuccess(callback: () => void) {
  const isDesktopApp = useIsDesktopApp()

  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      if (e.data === figmaConnectionSuccessMessage) callback()
    }

    window.addEventListener('message', handleMessage)

    if (isDesktopApp) {
      app.on('openProtocolURL', (_eventName: string, e: ToDesktopOpenProtocolUrlEvent) => {
        if (e.url.includes(figmaConnectionSuccessPath)) {
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
