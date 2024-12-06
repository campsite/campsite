import { Button } from '@campsite/ui/Button'
import { Dialog } from '@campsite/ui/Dialog'

import { useUnresolvePost } from '@/hooks/useUnresolvePost'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  postId: string
}

export function ConfirmDeleteResolutionDialog({ open, onOpenChange, postId }: Props) {
  const { mutate: unresolvePost } = useUnresolvePost()

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange} size='lg'>
      <Dialog.Header>
        <Dialog.Title>Reopen post?</Dialog.Title>
        <Dialog.Description>The previous resolution will be deleted and the post will reopened.</Dialog.Description>
      </Dialog.Header>

      <Dialog.Footer>
        <Dialog.TrailingActions>
          <Button variant='flat' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant='primary'
            onClick={() => {
              onOpenChange(false)
              unresolvePost({ postId })
            }}
            autoFocus
          >
            Reopen post
          </Button>
        </Dialog.TrailingActions>
      </Dialog.Footer>
    </Dialog.Root>
  )
}
