import { useState } from 'react'

import { Button } from '@campsite/ui'
import * as Dialog from '@campsite/ui/Dialog'

import { useDisconnectLinear } from '@/hooks/useDisconnectLinear'

export function DisconnectLinearConfirmationDialog() {
  const [dialogIsOpen, setDialogIsOpen] = useState(false)

  const { mutateAsync: disconnectLinear, isPending } = useDisconnectLinear()

  async function disconnect() {
    disconnectLinear().then(() => {
      setDialogIsOpen(false)
    })
  }

  return (
    <>
      <Button variant='flat' onClick={() => setDialogIsOpen(true)}>
        Disconnect
      </Button>

      <Dialog.Root open={dialogIsOpen} onOpenChange={setDialogIsOpen} size='lg'>
        <Dialog.Header>
          <Dialog.Title>Disconnect Linear?</Dialog.Title>
          <Dialog.Description>
            Removing the Linear connection will remove the option to create issues from posts and comments.
          </Dialog.Description>
        </Dialog.Header>

        <Dialog.Footer>
          <Dialog.TrailingActions>
            <Button disabled={isPending} onClick={() => setDialogIsOpen(false)}>
              Cancel
            </Button>
            <Button variant='destructive' disabled={isPending} loading={isPending} onClick={disconnect}>
              Disconnect
            </Button>
          </Dialog.TrailingActions>
        </Dialog.Footer>
      </Dialog.Root>
    </>
  )
}
