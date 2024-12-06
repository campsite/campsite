import { useState } from 'react'

import { Button, TextField } from '@campsite/ui'
import * as Dialog from '@campsite/ui/Dialog'

import { useGetInvitationUrl } from '@/hooks/useGetInvitationUrl'
import { useResetOrganizationInviteToken } from '@/hooks/useResetOrganizationInviteLink'

export function OrganizationInviteLinkField({ onboarding }: { onboarding?: boolean }) {
  const { data } = useGetInvitationUrl()

  if (!data?.invitation_url) return null

  return (
    <div className='flex items-center gap-2'>
      <div className='flex w-full flex-col'>
        <TextField
          id='invitation-link'
          name='invitation-link'
          readOnly
          label='Invitation link'
          labelHidden
          clickToCopy
          value={data.invitation_url}
        />
      </div>

      {/* Not needed when onboarding because the org is brand new — simplify all UI possible */}
      {!onboarding && <ResetInvitationUrlConfirmationDialog />}
    </div>
  )
}

function ResetInvitationUrlConfirmationDialog() {
  const [dialogIsOpen, setDialogIsOpen] = useState(false)
  const { mutate, isPending } = useResetOrganizationInviteToken()

  function onReset() {
    mutate(undefined, {
      onSuccess: () => {
        setDialogIsOpen(false)
      }
    })
  }

  return (
    <>
      <Button variant='plain' onClick={() => setDialogIsOpen(true)}>
        Reset
      </Button>

      <Dialog.Root open={dialogIsOpen} onOpenChange={setDialogIsOpen} size='lg'>
        <Dialog.Header>
          <Dialog.Title>Reset invitation URL?</Dialog.Title>
          <Dialog.Description>
            Resetting the invitation URL will invalidate all existing invitation links.
          </Dialog.Description>
        </Dialog.Header>

        <Dialog.Footer>
          <Dialog.TrailingActions>
            <Button disabled={isPending} onClick={() => setDialogIsOpen(false)}>
              Cancel
            </Button>
            <Button variant='destructive' disabled={isPending} loading={isPending} onClick={onReset}>
              Reset
            </Button>
          </Dialog.TrailingActions>
        </Dialog.Footer>
      </Dialog.Root>
    </>
  )
}
