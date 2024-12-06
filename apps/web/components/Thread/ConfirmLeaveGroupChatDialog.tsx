import { useRouter } from 'next/router'

import { MessageThread } from '@campsite/types'
import { Button } from '@campsite/ui'
import * as Dialog from '@campsite/ui/src/Dialog'

import { useScope } from '@/contexts/scope'
import { useGetThreads } from '@/hooks/useGetThreads'
import { useLeaveThread } from '@/hooks/useLeaveThread'

interface Props {
  thread: MessageThread
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ConfirmLeaveGroupChatDialog({ thread, open, onOpenChange }: Props) {
  const router = useRouter()
  const { scope } = useScope()
  const { mutate: leaveThread } = useLeaveThread({ threadId: thread.id })
  const { data: inbox } = useGetThreads()
  const { threads } = inbox || {}

  function handleLeave() {
    leaveThread(
      {},
      {
        onSuccess: () => {
          const otherThreads = threads?.filter((t) => t.id !== thread.id)

          if (otherThreads?.length) {
            router.push(`/${scope}/chat/${otherThreads[0].id}`)
          } else {
            router.push(`/${scope}`)
          }

          onOpenChange(false)
        }
      }
    )
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange} size='base'>
      <Dialog.Header>
        <Dialog.Title>Leave conversation?</Dialog.Title>
        <Dialog.Description>
          You will stop receiving messages from this conversation. Any messages you sent will still be visible to other
          members.
        </Dialog.Description>
      </Dialog.Header>

      <Dialog.Footer>
        <Dialog.TrailingActions>
          <Button variant='flat' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant='destructive' onClick={handleLeave} disabled={false} autoFocus>
            Leave group chat
          </Button>
        </Dialog.TrailingActions>
      </Dialog.Footer>
    </Dialog.Root>
  )
}
