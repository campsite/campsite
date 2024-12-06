import { Post } from '@campsite/types/generated'
import { Button } from '@campsite/ui/Button'
import { Dialog } from '@campsite/ui/Dialog'

import { useDeletePost } from '@/hooks/useDeletePost'

interface DeleteDraftDialogProps {
  post?: Post
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function DeleteDraftDialog({ post, open, onOpenChange, onSuccess }: DeleteDraftDialogProps) {
  const deletePostMutation = useDeletePost()

  const onDelete = () => {
    if (!post) return

    deletePostMutation.mutate(
      { post },
      {
        onSuccess: () => {
          onOpenChange(false)
          onSuccess?.()
        }
      }
    )
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Header>
        <Dialog.Title>Delete draft</Dialog.Title>
        <Dialog.Description>Are you sure you want to delete this draft?</Dialog.Description>
      </Dialog.Header>

      <Dialog.Footer>
        <Dialog.TrailingActions>
          <Button variant='flat' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>

          <Button autoFocus variant='destructive' onClick={onDelete}>
            Delete
          </Button>
        </Dialog.TrailingActions>
      </Dialog.Footer>
    </Dialog.Root>
  )
}
