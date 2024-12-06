import { useState } from 'react'
import * as SettingsSection from 'components/SettingsSection'
import { DisableTwoFactorAuthenticationDialog } from 'components/UserSettings/TwoFactorAuthentication/DisableTwoFactorAuthenticationDialog'
import { EnableTwoFactorAuthenticationDialog } from 'components/UserSettings/TwoFactorAuthentication/EnableTwoFactorAuthenticationDialog'
import { useGetCurrentUser } from 'hooks/useGetCurrentUser'

import { Button } from '@campsite/ui'

import { useCreateTwoFactorAuthenticationUri } from '@/hooks/useCreateTwoFactorAuthenticationUri'
import { apiErrorToast } from '@/utils/apiErrorToast'

export function TwoFactorAuthentication() {
  const { data: currentUser } = useGetCurrentUser()
  const createTwoFactorAuthentication = useCreateTwoFactorAuthenticationUri()
  const [provisioningUri, setProvisioningUri] = useState(null)
  const [enableDialogIsOpen, setEnableDialogIsOpen] = useState(false)
  const [disableDialogIsOpen, setDisableDialogIsOpen] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(currentUser?.two_factor_enabled)

  if (currentUser?.managed) {
    return null
  }

  function handleEnable(event: any) {
    event.preventDefault()

    createTwoFactorAuthentication.mutate(null, {
      onSuccess: async (data: any) => {
        setEnableDialogIsOpen(true)
        setProvisioningUri(data.two_factor_provisioning_uri)
      },
      onError: apiErrorToast
    })
  }

  function handleDisable(event: any) {
    event.preventDefault()
    setDisableDialogIsOpen(true)
  }

  // TODO: I added an open change handler in case someone clicks outside of the dialog
  // to close it. It won't call these complete functions though?
  function onEnableComplete(bool: boolean) {
    setTwoFactorEnabled(bool)
    setEnableDialogIsOpen(false)
  }

  function onDisableComplete(bool: boolean) {
    setTwoFactorEnabled(bool)
    setDisableDialogIsOpen(false)
  }

  return (
    <SettingsSection.Section>
      <SettingsSection.Header>
        <SettingsSection.Title>Two-factor authentication</SettingsSection.Title>
      </SettingsSection.Header>

      <SettingsSection.Description>Add an additional layer of security to your account</SettingsSection.Description>

      <SettingsSection.Separator />

      <div className='px-3 pb-3'>
        <Button
          variant={!twoFactorEnabled ? 'primary' : 'flat'}
          onClick={twoFactorEnabled ? handleDisable : handleEnable}
        >
          {twoFactorEnabled ? 'Disable' : 'Enable'}
        </Button>
      </div>

      {twoFactorEnabled ? (
        <DisableTwoFactorAuthenticationDialog
          open={disableDialogIsOpen}
          onOpenChange={setDisableDialogIsOpen}
          onComplete={onDisableComplete}
        />
      ) : (
        <EnableTwoFactorAuthenticationDialog
          open={enableDialogIsOpen}
          onOpenChange={setEnableDialogIsOpen}
          onComplete={onEnableComplete}
          provisioningUri={provisioningUri}
        />
      )}
    </SettingsSection.Section>
  )
}
