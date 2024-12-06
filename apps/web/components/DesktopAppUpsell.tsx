import { useState } from 'react'
import { isMacOS } from '@tiptap/core'
import { useTheme } from 'next-themes'
import { isIOS, isMacOs, isMobile } from 'react-device-detect'
import Balancer from 'react-wrap-balancer'

import { SITE_URL } from '@campsite/config'
import { Button, UIText } from '@campsite/ui'
import { useIsDesktopApp } from '@campsite/ui/src/hooks'

import {
  TroubleshootButton,
  TroubleshootDesktopNotificationsDialog,
  useSendTestNotification
} from '@/components/UserSettings/Notifications/PushNotificationSettings'
import { useStoredState } from '@/hooks/useStoredState'

export function DesktopAppUpsell({ onDownload }: { onDownload?: () => void }) {
  const isDesktopApp = useIsDesktopApp()
  const [troubleshootDesktopOpen, setTroubleshootDesktopOpen] = useState(false)
  const [hasDownloaded, setHasDownloaded] = useState(isDesktopApp)
  const [hasEnabledNotifications, setHasEnabledNotifications] = useStoredState('desktop_notifications_enabled', false)
  const { resolvedTheme } = useTheme()
  const images = {
    macos: {
      light: '/images/settings/macos-wallpaper-light.png',
      dark: '/images/settings/macos-wallpaper-dark.png'
    },
    windows: {
      light: '/images/settings/windows-wallpaper-light.png',
      dark: '/images/settings/windows-wallpaper-dark.png'
    }
  }
  const imageSet = isMacOs || isIOS ? images.macos : images.windows
  const resolvedImage = resolvedTheme === 'dark' ? imageSet.dark : imageSet.light
  const { didSendTestNotification, sendTestNotification } = useSendTestNotification()

  if (isMobile) return null

  return (
    <>
      <TroubleshootDesktopNotificationsDialog open={troubleshootDesktopOpen} setOpen={setTroubleshootDesktopOpen} />

      <div className='bg-elevated w-full overflow-hidden rounded-lg border'>
        <div className='flex h-full grid-cols-2 flex-col-reverse overflow-hidden md:grid'>
          <div className='flex flex-col p-8 md:border-r'>
            <UIText weight='font-medium' size='text-base'>
              {isDesktopApp ? 'Desktop notifications' : 'Desktop app'}
            </UIText>
            <UIText secondary className='mt-1'>
              <Balancer>
                {isDesktopApp
                  ? 'Get native desktop push notifications for new activity'
                  : 'A beautiful desktop experience to keep your conversations front and center.'}
              </Balancer>
            </UIText>
            <div className='mt-4 flex flex-wrap items-center gap-2'>
              {!isDesktopApp && !hasDownloaded && (
                <Button
                  href={`${SITE_URL}/desktop/download`}
                  externalLink
                  onClick={() => {
                    onDownload?.()
                    setHasDownloaded(true)
                  }}
                  variant='important'
                >
                  Download
                </Button>
              )}
              {(isDesktopApp || hasDownloaded) && isMacOS() && (
                <>
                  <Button
                    onClick={() => {
                      sendTestNotification()
                      setHasEnabledNotifications(true)
                    }}
                    variant={hasEnabledNotifications ? 'base' : 'important'}
                  >
                    {hasEnabledNotifications ? 'Send test notification' : 'Enable notifications'}
                  </Button>
                  <TroubleshootButton
                    onClick={didSendTestNotification ? () => setTroubleshootDesktopOpen(true) : undefined}
                  />
                </>
              )}
            </div>
          </div>

          <div
            className='min-h-46 overflow-hidden bg-cover bg-left-top bg-no-repeat'
            style={{
              backgroundImage: `url(${resolvedImage})`
            }}
          />
        </div>
      </div>
    </>
  )
}
