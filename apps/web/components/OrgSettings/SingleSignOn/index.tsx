import { useState } from 'react'

import { Button, LockIcon, UIText } from '@campsite/ui'
import { cn } from '@campsite/ui/src/utils'

import * as SettingsSection from '@/components/SettingsSection'
import { useCreateSSOPortalUrl } from '@/hooks/useCreateSSOPortalUrl'
import { useGetCurrentOrganization } from '@/hooks/useGetCurrentOrganization'
import { apiErrorToast } from '@/utils/apiErrorToast'

import { DisableSSODialog } from './DisableSSODialog'
import { EnableSSODialog } from './EnableSSODialog'

export function SingleSignOn() {
  const { data: currentOrg } = useGetCurrentOrganization()
  const [showEnableDialog, setShowEnableDialog] = useState(false)
  const [showDisableDialog, setShowDisableDialog] = useState(false)
  const [isConfiguring, setIsConfiguring] = useState(false)
  const [isSSOEnabled, setIsSSOEnabled] = useState(currentOrg?.sso_enabled)
  const createSSOPortalUrl = useCreateSSOPortalUrl()

  function handleEnableComplete() {
    setIsSSOEnabled(true)
    setShowEnableDialog(false)
  }

  function handleDisableComplete() {
    setIsSSOEnabled(false)
    setShowDisableDialog(false)
  }

  function handleConfigure() {
    setIsConfiguring(true)

    createSSOPortalUrl.mutate(undefined, {
      onSuccess: (result: any) => {
        window.location.href = result.sso_portal_url
      },
      onError: (error) => {
        apiErrorToast(error)
        setIsConfiguring(false)
      }
    })
  }

  return (
    <>
      <SettingsSection.Section>
        <SettingsSection.Header>
          <SettingsSection.Title>Single Sign-On</SettingsSection.Title>
        </SettingsSection.Header>

        <SettingsSection.Description>
          SSO authentication via an organization’s Identity Provider (IdP)
        </SettingsSection.Description>

        <SettingsSection.Separator />

        <div
          className={cn('flex flex-col px-3', {
            'pb-3': !isSSOEnabled
          })}
        >
          <div className='flex items-start space-x-4 space-y-0 sm:items-center sm:space-y-0'>
            <div className='flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-700 dark:bg-green-700/10 dark:text-green-500'>
              <LockIcon />
            </div>
            <div className='flex flex-1 flex-col'>
              <UIText weight='font-medium'>SAML</UIText>
              <UIText tertiary>Enable SSO authentication for your domains.</UIText>
            </div>

            {isSSOEnabled && <Button onClick={() => setShowDisableDialog(true)}>Disable</Button>}

            {!isSSOEnabled && <Button onClick={() => setShowEnableDialog(true)}>Enable</Button>}
          </div>
        </div>

        {isSSOEnabled && (
          <>
            <SettingsSection.Separator />

            <div className='flex flex-col px-3 pb-3'>
              <div className='flex items-start space-x-4 space-y-0 sm:items-center sm:space-y-0'>
                <div className='ml-14 flex flex-1 flex-col'>
                  <UIText tertiary>Configure your Identity Provider (IdP).</UIText>
                </div>

                <Button onClick={handleConfigure} loading={isConfiguring} variant='primary' disabled={!isSSOEnabled}>
                  Configure
                </Button>
              </div>
            </div>
          </>
        )}
      </SettingsSection.Section>

      <EnableSSODialog
        open={showEnableDialog}
        onOpenChange={(bool: boolean) => setShowEnableDialog(bool)}
        onComplete={handleEnableComplete}
      />

      <DisableSSODialog
        open={showDisableDialog}
        onComplete={handleDisableComplete}
        onOpenChange={(bool: boolean) => setShowDisableDialog(bool)}
      />
    </>
  )
}
