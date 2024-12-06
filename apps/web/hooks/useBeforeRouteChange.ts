import { useEffect } from 'react'
import Router from 'next/router'

import { useCallbackRef } from '@campsite/ui/hooks'

export function useBeforeRouteChange(fn: () => void, enabled = true) {
  const fnRef = useCallbackRef(fn)

  useEffect(() => {
    if (!enabled) return

    const onRouteChangeStart = (destination: string) => {
      const currentBasePath = Router.asPath.split('?')[0]
      const destinationBasePath = destination.split('?')[0]

      if (currentBasePath !== destinationBasePath) {
        fnRef()
      }
    }

    Router.events.on('routeChangeStart', onRouteChangeStart)
    return () => {
      Router.events.off('routeChangeStart', onRouteChangeStart)
    }
  }, [enabled, fnRef])

  useEffect(() => {
    if (!enabled) return

    window.addEventListener('beforeunload', fnRef)
    return () => {
      window.removeEventListener('beforeunload', fnRef)
    }
  }, [enabled, fnRef])
}
