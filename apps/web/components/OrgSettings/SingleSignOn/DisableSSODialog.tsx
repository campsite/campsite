import { toast } from 'react-hot-toast'

import { Button } from '@campsite/ui'
import * as Dialog from '@campsite/ui/src/Dialog'

import { useDisableSSO } from '@/hooks/useDisableSSO'
import { apiErrorToast } from '@/utils/apiErrorToast'

interface Props {
  open: boolean
  onComplete: () => void
  onOpenChange: (bool: boolean) => void
}

export function DisableSSODialog({ open, onOpenChange, onComplete }: Props) {
  const disableSSO = useDisableSSO()

  async function handleDisable() {
    disableSSO.mutate(null, {
      onSuccess: async () => {
        toast('Successfully disabled SSO authentication for your domains.')
        onComplete()
      },
      onError: apiErrorToast
    })
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Header>
        <Dialog.Title>Disable Single Sign-On</Dialog.Title>
        <Dialog.Description>
          This will disable SSO authentication for your organization. Are you sure?
        </Dialog.Description>
      </Dialog.Header>

      <Dialog.Footer>
        <Dialog.TrailingActions>
          <Button variant='flat' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button loading={disableSSO.isPending} variant='destructive' onClick={handleDisable} autoFocus>
            Disable
          </Button>
        </Dialog.TrailingActions>
      </Dialog.Footer>
    </Dialog.Root>
  )
}
