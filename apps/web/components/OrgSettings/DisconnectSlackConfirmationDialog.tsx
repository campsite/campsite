import { useState } from 'react'

import { Button } from '@campsite/ui'
import * as Dialog from '@campsite/ui/src/Dialog'

import { useDisconnectSlack } from '@/hooks/useDisconnectSlack'

export function DisconnectSlackConfirmationDialog() {
  const [dialogIsOpen, setDialogIsOpen] = useState(false)

  const disconnectSlack = useDisconnectSlack()

  async function disconnect() {
    await disconnectSlack.mutate()
    setDialogIsOpen(false)
  }

  return (
    <>
      <Button variant='flat' onClick={() => setDialogIsOpen(true)}>
        Disconnect
      </Button>

      <Dialog.Root open={dialogIsOpen} onOpenChange={setDialogIsOpen} size='lg'>
        <Dialog.Header>
          <Dialog.Title>Disconnect Slack?</Dialog.Title>
          <Dialog.Description>
            Removing the Slack connection will disable all broadcasts when new posts are shared in your organization.
          </Dialog.Description>
        </Dialog.Header>

        <Dialog.Footer>
          <Dialog.TrailingActions>
            <Button disabled={disconnectSlack.isPending} onClick={() => setDialogIsOpen(false)}>
              Cancel
            </Button>
            <Button
              variant='destructive'
              disabled={disconnectSlack.isPending}
              loading={disconnectSlack.isPending}
              onClick={disconnect}
              autoFocus
            >
              Disconnect
            </Button>
          </Dialog.TrailingActions>
        </Dialog.Footer>
      </Dialog.Root>
    </>
  )
}
