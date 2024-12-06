import { useRouter } from 'next/router'
import toast from 'react-hot-toast'

import { MessageThread } from '@campsite/types/generated'
import { Button } from '@campsite/ui'
import * as Dialog from '@campsite/ui/src/Dialog'

import { useScope } from '@/contexts/scope'
import { useDeleteThread } from '@/hooks/useDeleteThread'

interface Props {
  thread: MessageThread
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteThreadDialog({ thread, open, onOpenChange }: Props) {
  const router = useRouter()
  const { scope } = useScope()
  const deleteThreadMutation = useDeleteThread()

  function handleDelete() {
    deleteThreadMutation.mutate(thread.id, {
      onSuccess: () => {
        onOpenChange(false)
        toast('Chat permanently deleted')
        router.push(`/${scope}/chat`)
      }
    })
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange} size='lg'>
      <Dialog.Header>
        <Dialog.Title>Delete chat</Dialog.Title>
        <Dialog.Description>
          Are you sure you want to delete this chat? This action cannot be undone. All messages will be permanently
          deleted for everyone in this conversation.
        </Dialog.Description>
      </Dialog.Header>

      <Dialog.Footer>
        <Dialog.TrailingActions>
          <Button variant='flat' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant='destructive' onClick={handleDelete} loading={deleteThreadMutation.isPending} autoFocus>
            Delete chat
          </Button>
        </Dialog.TrailingActions>
      </Dialog.Footer>
    </Dialog.Root>
  )
}
