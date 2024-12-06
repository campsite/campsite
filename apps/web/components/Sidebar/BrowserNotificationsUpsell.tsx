import { Button } from '@campsite/ui/Button'
import { useIsDesktopApp } from '@campsite/ui/hooks'
import { UIText } from '@campsite/ui/Text'

import { useCreateDesktopOrBrowserNotification } from '@/hooks/useCreateDesktopOrBrowserNotification'
import { useIsPWA } from '@/hooks/useIsPWA'

export function BrowserNotificationsUpsell() {
  const isPwa = useIsPWA()
  const isDesktop = useIsDesktopApp()
  const createDesktopOrBrowserNotification = useCreateDesktopOrBrowserNotification()

  if (isDesktop || isPwa || !('Notification' in window) || Notification.permission !== 'default') return null

  function onClick() {
    Notification.requestPermission().then((permission) => {
      // If the user accepts, let's create a notification
      if (permission === 'granted') {
        createDesktopOrBrowserNotification({
          title: 'Subscribed to notifications',
          body: 'Push notifications enabled.',
          tag: 'notifications-enabled'
        })
      }
    })
  }

  return (
    <div className='bg-elevated mb-2 flex flex-col gap-2 rounded-lg border p-3'>
      <UIText size='text-xs' secondary className='text-balance'>
        Campsite needs your permission to enable notifications.
      </UIText>
      <Button size='sm' variant='important' onClick={onClick}>
        Enable notifications
      </Button>
    </div>
  )
}
