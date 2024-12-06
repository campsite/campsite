import toast from 'react-hot-toast'

import { CustomReaction } from '@campsite/types'
import { Button } from '@campsite/ui'
import * as Dialog from '@campsite/ui/src/Dialog'

import { useDeleteCustomReaction } from '@/hooks/useDeleteCustomReaction'
import { apiErrorToast } from '@/utils/apiErrorToast'

interface Props {
  customReaction: CustomReaction
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteCustomReactionDialog({ customReaction, open, onOpenChange }: Props) {
  const { mutate, isPending: isDisabled } = useDeleteCustomReaction()

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange} size='sm'>
      <Dialog.Header>
        <Dialog.Title>Delete custom reaction</Dialog.Title>
        <Dialog.Description>Are you sure you want to delete this reaction?</Dialog.Description>
      </Dialog.Header>

      <Dialog.Footer>
        <Dialog.TrailingActions>
          <Button variant='flat' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant='destructive'
            onClick={() =>
              mutate(customReaction.id, {
                onSuccess: () => toast('Reaction deleted'),
                onError: apiErrorToast
              })
            }
            disabled={isDisabled}
          >
            Delete
          </Button>
        </Dialog.TrailingActions>
      </Dialog.Footer>
    </Dialog.Root>
  )
}
