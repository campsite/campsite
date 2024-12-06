import { useState } from 'react'
import toast from 'react-hot-toast'

import { Button, TextField } from '@campsite/ui'
import * as Dialog from '@campsite/ui/Dialog'

import { useGetProjectInvitationUrl } from '@/hooks/useGetProjectInvitationUrl'
import { useResetProjectInvitationUrl } from '@/hooks/useResetProjectInvitationUrl'

export function ProjectGuestInviteLinkField({ projectId }: { projectId: string }) {
  const { data } = useGetProjectInvitationUrl({ projectId })
  const invitationUrl = data?.invitation_url

  if (!invitationUrl) return null

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
          value={invitationUrl}
        />
      </div>

      <ResetInvitationUrlConfirmationDialog projectId={projectId} />
    </div>
  )
}

function ResetInvitationUrlConfirmationDialog({ projectId }: { projectId: string }) {
  const [dialogIsOpen, setDialogIsOpen] = useState(false)
  const { mutate, isPending } = useResetProjectInvitationUrl({ projectId })

  function onReset() {
    mutate(undefined, {
      onSuccess: () => {
        toast('Invitation link successfully reset')
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
            Resetting the invitation URL will invalidate all existing invitation links for this channel.
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
