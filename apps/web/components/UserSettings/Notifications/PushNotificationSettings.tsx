import { useState } from 'react'
import * as SettingsSection from 'components/SettingsSection'
import { AnimatePresence, motion } from 'framer-motion'
import { useSetAtom } from 'jotai'
import { useTheme } from 'next-themes'
import Image from 'next/image'
import { isIOS, isMacOs, isMobile } from 'react-device-detect'

import { SITE_URL } from '@campsite/config'
import { Button, Link, UIText } from '@campsite/ui'
import * as D from '@campsite/ui/src/Dialog'
import { useIsDesktopApp } from '@campsite/ui/src/hooks'
import { cn } from '@campsite/ui/src/utils'

import { EnablePush } from '@/components/EnablePush'
import { setFeedbackDialogOpenAtom } from '@/components/Feedback/FeedbackDialog'
import { useCreateDesktopOrBrowserNotification } from '@/hooks/useCreateDesktopOrBrowserNotification'
import { useIsPWA } from '@/hooks/useIsPWA'

export function useSendTestNotification() {
  const [didSendTestNotification, setDidSendTestNotification] = useState(false)
  const createDesktopOrBrowserNotification = useCreateDesktopOrBrowserNotification()

  function sendTestNotification() {
    createDesktopOrBrowserNotification({
      title: 'Subscribed to notifications',
      body: 'Push notifications enabled.',
      tag: 'notifications-enabled'
    })

    setDidSendTestNotification(true)
  }

  return { didSendTestNotification, sendTestNotification }
}

export function TroubleshootButton({ onClick }: { onClick?: () => void }) {
  return (
    <AnimatePresence>
      {onClick && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <Button onClick={onClick} variant='plain'>
            Troubleshoot
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function PushNotificationSettings() {
  const [troubleshootDesktopOpen, setTroubleshootDesktopOpen] = useState(false)
  const [iOSGuideOpen, setiOSGuideOpen] = useState(false)
  const isDesktopApp = useIsDesktopApp()
  const isPWA = useIsPWA()
  const { didSendTestNotification, sendTestNotification } = useSendTestNotification()

  return (
    <>
      <TroubleshootDesktopNotificationsDialog open={troubleshootDesktopOpen} setOpen={setTroubleshootDesktopOpen} />
      <PWAInstallGuideDialog open={iOSGuideOpen} setOpen={setiOSGuideOpen} />

      <SettingsSection.Section id='push-notifications'>
        <SettingsSection.Header>
          <SettingsSection.Title>Push notifications</SettingsSection.Title>
        </SettingsSection.Header>

        <SettingsSection.Description>
          Receive native push notifications from desktop and mobile
        </SettingsSection.Description>

        <SettingsSection.Separator />

        <div className='flex flex-col'>
          <div className='flex items-center gap-3 p-3 pt-0'>
            <UIText weight='font-medium' className='flex-1'>
              Campsite Desktop app
            </UIText>

            {isDesktopApp ? (
              <div className='flex gap-2'>
                <TroubleshootButton
                  onClick={didSendTestNotification ? () => setTroubleshootDesktopOpen(true) : undefined}
                />
                <Button onClick={sendTestNotification} variant='primary'>
                  Send test notification
                </Button>
              </div>
            ) : (
              <Button variant='primary' href={`${SITE_URL}/desktop/download`} externalLink>
                Download
              </Button>
            )}
          </div>

          {!isPWA && (
            <div className='flex items-center gap-3 border-t p-3'>
              <UIText weight='font-medium' className='flex-1'>
                Add to mobile home screen
              </UIText>

              <Button variant='primary' onClick={() => setiOSGuideOpen(true)}>
                Show me how
              </Button>
            </div>
          )}
        </div>

        {isPWA && <EnablePush hideAfterPrompt={false} containerClassName='border-t p-3' />}
      </SettingsSection.Section>
    </>
  )
}

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
}

export function TroubleshootDesktopNotificationsDialog({ open, setOpen }: Props) {
  const setFeedbackDialogOpen = useSetAtom(setFeedbackDialogOpenAtom)
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const macOS = isMacOs

  const macosImages = {
    light: '/images/settings/macos-settings-light.png',
    dark: '/images/settings/macos-settings-dark.png'
  }

  const windowsImages = {
    light: '/images/settings/windows-settings-light.png',
    dark: '/images/settings/windows-settings-dark.png'
  }

  const images = macOS ? macosImages : windowsImages
  const resolvedImage = isDark ? images.dark : images.light

  const description = macOS
    ? 'Make sure “Allow notifications” is enabled in the macOS notification settings.'
    : 'Make sure notifications are enabled in the Windows notification settings.'

  return (
    <D.Root open={open} onOpenChange={setOpen} size='xl'>
      <D.Header>
        <D.Title>Desktop push notifications</D.Title>
        <D.Description>{description}</D.Description>
        <D.Description>
          If you’re still having trouble,{' '}
          <button className='text-blue-500 hover:underline' onClick={() => setFeedbackDialogOpen(true)}>
            get in touch
          </button>
          .
        </D.Description>
      </D.Header>

      <div className='-mb-4 -mt-2 flex items-center justify-center'>
        <Image
          src={resolvedImage}
          alt='An image of the notification settings page for Campsite with notifications enabled'
          width={551}
          height={412}
        />
      </div>

      <D.Footer>
        <D.TrailingActions>
          <Button onClick={() => setOpen(false)} autoFocus>
            Close
          </Button>
        </D.TrailingActions>
      </D.Footer>
    </D.Root>
  )
}

export function PWAInstallGuideDialog({ open, setOpen }: Props) {
  const setFeedbackDialogOpen = useSetAtom(setFeedbackDialogOpenAtom)
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const defaultPlatform = isIOS || isMacOs ? 'ios' : 'android'
  const [platform, setPlatform] = useState<'ios' | 'android'>(defaultPlatform)
  const showToggle = !isMobile

  const iosImages = {
    createBookmark: {
      light: '/images/settings/ios-create-bookmark-light.png',
      dark: '/images/settings/ios-create-bookmark-dark.png'
    },
    addToHomeScreen: {
      light: '/images/settings/ios-add-to-home-light.png',
      dark: '/images/settings/ios-add-to-home-dark.png'
    }
  }

  const androidImages = {
    createBookmark: {
      light: '/images/settings/android-create-bookmark-light.png',
      dark: '/images/settings/android-create-bookmark-dark.png'
    },
    addToHomeScreen: {
      light: '/images/settings/android-add-to-home-light.png',
      dark: '/images/settings/android-add-to-home-dark.png'
    }
  }

  const platformIOS = platform === 'ios'
  const imageSet = platformIOS ? iosImages : androidImages
  const resolvedCreateBookmark = isDark ? imageSet.createBookmark.dark : imageSet.createBookmark.light
  const resolvedAddToHomeScreen = isDark ? imageSet.addToHomeScreen.dark : imageSet.addToHomeScreen.light
  const description = platformIOS
    ? 'From the Safari app, navigate to app.campsite.com, tap the share button and select “Add to Home Screen”.'
    : 'From the Chrome app, navigate to app.campsite.com, tap the ••• menu button and select “Add to Home Screen”.'

  return (
    <D.Root open={open} onOpenChange={setOpen} size='xl'>
      <D.Header>
        <D.Title>Add to home screen</D.Title>
        <D.Description>{description}</D.Description>
        <D.Description>
          If you run into issues, read the full{' '}
          <Link
            href='https://app.campsite.com/campsite/p/notes/install-the-campsite-mobile-app-9g4aof0csg18'
            target='_blank'
            className='text-blue-500 hover:underline'
          >
            installation instructions
          </Link>{' '}
          or{' '}
          <button className='text-blue-500 hover:underline' onClick={() => setFeedbackDialogOpen(true)}>
            get in touch
          </button>
          .
        </D.Description>
      </D.Header>

      {showToggle && (
        <div className='p-4 pt-0'>
          <div className='bg-tertiary -my-1 flex items-center gap-0.5 rounded-full p-1'>
            <Button
              round
              fullWidth
              onClick={() => setPlatform('ios')}
              variant={platformIOS ? 'base' : 'plain'}
              className={cn({
                'text-tertiary hover:text-primary': !platformIOS,
                'dark:bg-gray-700': platformIOS
              })}
            >
              iOS
            </Button>
            <Button
              round
              fullWidth
              onClick={() => setPlatform('android')}
              variant={platformIOS ? 'plain' : 'base'}
              className={cn({
                'text-tertiary hover:text-primary': platformIOS,
                'dark:bg-gray-700': !platformIOS
              })}
            >
              Android
            </Button>
          </div>
        </div>
      )}

      <div className='flex items-center justify-center gap-4 px-4 pb-8 pt-4 lg:gap-8'>
        <Image
          src={resolvedAddToHomeScreen}
          alt='An image of the the mobile browser share sheet to customize a bookmark details'
          width={393 / 2}
          height={1183 / 2}
          className='shadow-popover h-full max-h-[428px] overflow-hidden rounded-lg object-contain ring-1 ring-black/5 dark:ring-white/5'
        />
        <Image
          src={resolvedCreateBookmark}
          alt='An image of the the mobile browser share sheet with an option to add a website to your home screen'
          width={393 / 2}
          height={1183 / 2}
          className='shadow-popover h-full max-h-[428px] overflow-hidden rounded-lg object-contain ring-1 ring-black/5 dark:ring-white/5'
        />
      </div>

      <D.Footer>
        <D.TrailingActions>
          <Button onClick={() => setOpen(false)} autoFocus>
            Close
          </Button>
        </D.TrailingActions>
      </D.Footer>
    </D.Root>
  )
}
