import { useState } from 'react'
import { AnimatePresence, m } from 'framer-motion'
import { useTheme } from 'next-themes'
import Image from 'next/image'
import { isMobile } from 'react-device-detect'
import QRCode from 'react-qr-code'
import Balancer from 'react-wrap-balancer'

import { WEB_URL } from '@campsite/config'
import {
  ALL_CONTAINER_STYLES,
  ANIMATION_CONSTANTS,
  Button,
  Popover,
  PopoverContent,
  PopoverPortal,
  PopoverTrigger,
  QRCodeIcon,
  UIText
} from '@campsite/ui'

import { PWAInstallGuideDialog } from '@/components/UserSettings/Notifications/PushNotificationSettings'
import { useIsPWA } from '@/hooks/useIsPWA'
import { useStoredState } from '@/hooks/useStoredState'

export function PWAUpsell({ onSelect }: { onSelect?: () => void }) {
  const [guideDialogOpen, setGuideDialogOpen] = useState(false)
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const image = isDark ? '/images/settings/mobile-dark.png' : '/images/settings/mobile-light.png'
  const isPwa = useIsPWA()
  const title = isMobile ? 'Add to home screen' : 'iOS & Android'
  const [hasViewedGuide, setHasViewedGuide] = useStoredState('pwa_guide_viewed', false)

  if (isPwa) return null

  return (
    <>
      <PWAInstallGuideDialog open={guideDialogOpen} setOpen={setGuideDialogOpen} />
      <div className='bg-elevated w-full overflow-hidden rounded-lg border'>
        <div className='flex h-full grid-cols-2 flex-col-reverse overflow-hidden md:grid'>
          <div className='flex flex-col justify-center p-8'>
            <UIText weight='font-medium' size='text-base'>
              {title}
            </UIText>
            <UIText secondary className='mt-1'>
              <Balancer>Get native push notifications with the mobile web app.</Balancer>
            </UIText>
            <div className='mt-4 flex flex-wrap items-center gap-2'>
              <Button
                onClick={() => {
                  setGuideDialogOpen(true)
                  onSelect?.()
                  setHasViewedGuide(true)
                }}
                variant={hasViewedGuide ? 'base' : 'important'}
              >
                Show me how
              </Button>
              <QRCodePopover onScan={onSelect} />
            </div>
          </div>

          <div className='dark:bg-primary bg-secondary lg:border-l-primary flex h-full w-full items-end border-b pt-2 lg:border-b-0 lg:border-l'>
            <Image src={image} width={680} height={400} alt='Mobile web app' />
          </div>
        </div>
      </div>
    </>
  )
}

function QRCodePopover({ onScan }: { onScan?: () => void }) {
  const [open, setOpen] = useState(false)
  const isPWA = useIsPWA()

  if (isPWA || isMobile) return null

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          leftSlot={<QRCodeIcon size={20} />}
          onClick={() => {
            setTimeout(() => onScan?.(), 3000)
          }}
          variant='base'
        >
          Scan
        </Button>
      </PopoverTrigger>
      <AnimatePresence>
        {open && (
          <PopoverPortal>
            <PopoverContent className='z-10' asChild forceMount side='bottom' align='center' sideOffset={4}>
              <m.div {...ANIMATION_CONSTANTS} className={ALL_CONTAINER_STYLES}>
                <div className='relative flex flex-none p-3'>
                  <QRCode size={200} value={WEB_URL} />
                </div>
              </m.div>
            </PopoverContent>
          </PopoverPortal>
        )}
      </AnimatePresence>
    </Popover>
  )
}
