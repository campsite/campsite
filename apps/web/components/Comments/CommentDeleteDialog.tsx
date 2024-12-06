import { useCallback } from 'react'
import { useSetAtom } from 'jotai'
import pluralize from 'pluralize'
import toast from 'react-hot-toast'

import { Comment } from '@campsite/types'
import { AlertIcon, Button, UIText } from '@campsite/ui'
import * as Dialog from '@campsite/ui/src/Dialog'

import { useDeleteComment } from '@/hooks/useDeleteComment'

import { clearNewCommentCoordinatesAtom, selectedCanvasCommentIdAtom } from '../CanvasComments/CanvasComments'

interface CommentDeleteDialogProps {
  comment: Comment
  subjectId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommentDeleteDialog({ comment, subjectId, open, onOpenChange }: CommentDeleteDialogProps) {
  const deleteCommentMutation = useDeleteComment({
    subject_id: subjectId,
    comment_id: comment.id,
    parent_id: comment.parent_id
  })

  const setSelectedCanvasCommentId = useSetAtom(selectedCanvasCommentIdAtom)
  const setClearNewCommentCoordinates = useSetAtom(clearNewCommentCoordinatesAtom)

  const handleCleanup = useCallback(() => {
    setSelectedCanvasCommentId(undefined)
    setClearNewCommentCoordinates()
    toast('Comment deleted')
    onOpenChange(false)
  }, [onOpenChange, setClearNewCommentCoordinates, setSelectedCanvasCommentId])

  const title = comment.replies.length > 0 ? 'Delete comment and replies' : 'Delete comment'

  const description =
    comment.replies.length > 0
      ? 'Are you sure you want to delete this comment and its replies? This action cannot be undone.'
      : 'Are you sure you want to delete this comment? This action cannot be undone.'

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Header>
        <Dialog.Title>{title}</Dialog.Title>
        <Dialog.Description>{description}</Dialog.Description>
      </Dialog.Header>

      {comment.replies.length > 0 && (
        <Dialog.Content>
          <div className='flex items-start justify-center gap-2 rounded-lg bg-amber-50 p-2.5 text-amber-900 dark:bg-amber-300/10 dark:text-amber-200'>
            <AlertIcon />
            <UIText size='text-sm' inherit>
              This will also delete {comment.replies.length} {pluralize('reply', comment.replies.length)}. This action
              cannot be undone.
            </UIText>
          </div>
        </Dialog.Content>
      )}

      <Dialog.Footer>
        <Dialog.TrailingActions>
          <Button variant='flat' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>

          <Button
            variant='destructive'
            onClick={() =>
              deleteCommentMutation.mutate(undefined, {
                onSuccess: () => handleCleanup()
              })
            }
            disabled={deleteCommentMutation.isPending}
            autoFocus
          >
            Delete
          </Button>
        </Dialog.TrailingActions>
      </Dialog.Footer>
    </Dialog.Root>
  )
}
