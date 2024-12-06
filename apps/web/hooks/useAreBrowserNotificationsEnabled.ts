import { isAndroid, isChrome, isChromium, isOpera, isSamsungBrowser } from 'react-device-detect'

import { useIsDesktopApp } from '@campsite/ui/hooks'

import { useIsPWA } from '@/hooks/useIsPWA'

export function useAreBrowserNotificationsEnabled() {
  const isDesktop = useIsDesktopApp()
  const isPwa = useIsPWA()
  // https://caniuse.com/mdn-api_notification
  const onlySupportsNotificationsInServiceWorkers = isAndroid && (isChrome || isChromium || isSamsungBrowser || isOpera)

  return (
    !isDesktop &&
    !isPwa &&
    !onlySupportsNotificationsInServiceWorkers &&
    'Notification' in window &&
    Notification.permission === 'granted'
  )
}
