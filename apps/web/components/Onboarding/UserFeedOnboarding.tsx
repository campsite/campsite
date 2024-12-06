import { useState } from 'react'
import { AnimatePresence, m } from 'framer-motion'

import { Button, CloseIcon } from '@campsite/ui'

import { DesktopAppUpsell } from '@/components/DesktopAppUpsell'
import { PWAUpsell } from '@/components/PWAUpsell'
import { useGetCurrentOrganization } from '@/hooks/useGetCurrentOrganization'
import { useGetCurrentUser } from '@/hooks/useGetCurrentUser'
import { useIsPWA } from '@/hooks/useIsPWA'
import { useUpdatePreference } from '@/hooks/useUpdatePreference'

export function UserFeedOnboarding() {
  const [open, setOpen] = useState(true)

  const isPWA = useIsPWA()
  const updatePreference = useUpdatePreference()
  const { data: currentUser } = useGetCurrentUser()
  const { data: currentOrganization } = useGetCurrentOrganization()
  const isAdmin = currentOrganization?.viewer_is_admin

  const hasOnboardedApps = currentUser?.preferences?.feature_tip_onboard_install_apps === 'true'
  const show = !hasOnboardedApps && !isAdmin && !isPWA

  if (!show) return null

  return (
    <div className='relative md:-mx-4'>
      <AnimatePresence initial={false}>
        {open && (
          <m.div
            animate={{ height: 'auto', opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: -100 }}
            transition={{
              duration: 0.3,
              ease: 'easeInOut'
            }}
            className='overflow-hidden'
          >
            <div className='bg-secondary dark:bg-primary relative mb-4 flex-none overflow-hidden border-b p-6 lg:p-8'>
              <div className='mx-auto flex w-full max-w-[--feed-width] flex-col gap-4'>
                <DesktopAppUpsell />
                <PWAUpsell />
              </div>
            </div>
          </m.div>
        )}
      </AnimatePresence>

      {open && (
        <Button
          round
          tooltip='Hide app upsells'
          className='absolute bottom-0.5 left-1/2 -translate-x-1/2'
          onClick={() => {
            setOpen(false)
            setTimeout(() => {
              // wait for close animation to complete
              updatePreference.mutate({
                preference: 'feature_tip_onboard_install_apps',
                value: 'true'
              })
            }, 300)
          }}
          leftSlot={<CloseIcon />}
          accessibilityLabel='Hide app upsells'
        >
          Dismiss
        </Button>
      )}
    </div>
  )
}
