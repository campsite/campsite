import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'

import { Button, FormError, MutationError, TextField, UIText } from '@campsite/ui'
import * as Dialog from '@campsite/ui/src/Dialog'

import { useDisableTwoFactorAuthentication } from '@/hooks/useDisableTwoFactorAuthentication'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onComplete: (bool: boolean) => void
}

export function DisableTwoFactorAuthenticationDialog({ open, onOpenChange, onComplete }: Props) {
  const disableTwoFactorAuthentication = useDisableTwoFactorAuthentication()
  const [authenticationCode, setAuthenticationCode] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')

  useEffect(() => {
    setAuthenticationCode('')
  }, [open])

  async function handleSubmit(e: any) {
    e.preventDefault()

    disableTwoFactorAuthentication.mutate(
      {
        otp_attempt: authenticationCode,
        password: currentPassword
      },
      {
        onSuccess: async () => {
          toast('Successfully disabled two-factor authentication.')
          onComplete(false)
        }
      }
    )
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange} disableDescribedBy>
      <Dialog.Header>
        <Dialog.Title>Disable two-factor authentication</Dialog.Title>
      </Dialog.Header>

      <form onSubmit={handleSubmit} autoComplete='off'>
        <Dialog.Content>
          <div className='flex flex-col space-y-3 pb-3'>
            <div className='flex flex-col gap-2'>
              <UIText secondary>Enter the six-digit code from your authenticator app.</UIText>
              <TextField
                id='authentication-code'
                name='authentication-code'
                label='Authentication code'
                labelHidden
                placeholder='Authentication code'
                onChange={(value) => setAuthenticationCode(value)}
                value={authenticationCode}
                required
              />
            </div>

            <div className='flex flex-col gap-2'>
              <UIText secondary>Enter your Campsite account password to confirm your identity.</UIText>
              <TextField
                type='password'
                id='current-password'
                name='current-password'
                label='Current password'
                labelHidden
                placeholder='Current password'
                onChange={(value) => setCurrentPassword(value)}
                value={currentPassword}
                required
              />
            </div>

            <FormError>
              {disableTwoFactorAuthentication.isError && <MutationError mutation={disableTwoFactorAuthentication} />}
            </FormError>
          </div>
        </Dialog.Content>

        <Dialog.Footer>
          <Dialog.TrailingActions>
            <Button
              variant='flat'
              disabled={disableTwoFactorAuthentication.isPending}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              disabled={disableTwoFactorAuthentication.isPending}
              loading={disableTwoFactorAuthentication.isPending}
              type='submit'
              variant='primary'
              onClick={handleSubmit}
            >
              Disable
            </Button>
          </Dialog.TrailingActions>
        </Dialog.Footer>
      </form>
    </Dialog.Root>
  )
}
