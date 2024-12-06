import { Call } from '@campsite/types'
import { Button } from '@campsite/ui'
import * as Dialog from '@campsite/ui/src/Dialog'

import { useDeleteAllCallRecordings } from '@/hooks/useDeleteAllCallRecordings'

interface Props {
  call: Call
  open: boolean
  onOpenChange: (open: boolean) => void
  onDelete?: () => void
}

export function DeleteAllCallRecordingsDialog({ call, open, onOpenChange, onDelete }: Props) {
  const { mutate: deleteRecording, isPending } = useDeleteAllCallRecordings({ callId: call.id })

  function handleDelete() {
    deleteRecording()
    onOpenChange(false)
    onDelete?.()
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange} size='sm'>
      <Dialog.Header>
        <Dialog.Title>Delete call</Dialog.Title>
        <Dialog.Description>
          Are you sure you want to delete this call? This action cannot be undone.
        </Dialog.Description>
      </Dialog.Header>

      <Dialog.Footer>
        <Dialog.TrailingActions>
          <Button variant='flat' onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button variant='destructive' onClick={handleDelete} disabled={isPending} autoFocus>
            Delete call
          </Button>
        </Dialog.TrailingActions>
      </Dialog.Footer>
    </Dialog.Root>
  )
}
