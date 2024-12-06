import { useRouter } from 'next/router'

import { Button } from '@campsite/ui'
import * as Dialog from '@campsite/ui/src/Dialog'

import { useGoBack } from '@/components/Providers/HistoryProvider'
import { useScope } from '@/contexts/scope'
import { useDeleteNote } from '@/hooks/useDeleteNote'
import { apiErrorToast } from '@/utils/apiErrorToast'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  noteId?: string
  noteProjectId?: string
}

export function DeleteNoteDialog({ open, onOpenChange, noteId, noteProjectId }: Props) {
  const goBack = useGoBack()
  const { scope } = useScope()
  const { mutate: deleteNote } = useDeleteNote()
  const router = useRouter()

  function onDelete() {
    if (!noteId) return

    deleteNote(
      { noteId, noteProjectId },
      {
        onSuccess: () => {
          const isNoteView = router.pathname === '/[org]/notes/[noteId]'

          if (isNoteView) {
            goBack({ fallbackPath: `/${scope}/notes` })
          }
        },
        onError: apiErrorToast
      }
    )
    onOpenChange(false)
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange} size='sm'>
      <Dialog.Header>
        <Dialog.Title>Delete document</Dialog.Title>
        <Dialog.Description>
          Are you sure you want to delete this document? This action cannot be undone.
        </Dialog.Description>
      </Dialog.Header>

      <Dialog.Footer>
        <Dialog.TrailingActions>
          <Button variant='flat' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant='destructive' onClick={onDelete} autoFocus>
            Delete
          </Button>
        </Dialog.TrailingActions>
      </Dialog.Footer>
    </Dialog.Root>
  )
}
