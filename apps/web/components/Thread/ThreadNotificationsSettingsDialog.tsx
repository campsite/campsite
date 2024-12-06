import { useState } from 'react'
import toast from 'react-hot-toast'

import { MessageThreadMembership } from '@campsite/types'
import { Button, RadioGroup, RadioGroupItem, UIText } from '@campsite/ui'
import * as Dialog from '@campsite/ui/src/Dialog'

import { useUpdateThreadMembership } from '@/hooks/useUpdateThreadMembership'
import { apiErrorToast } from '@/utils/apiErrorToast'

interface Props {
  threadId: string
  membership: MessageThreadMembership
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ThreadNotificationsSettingsDialog({ membership, threadId, open, onOpenChange }: Props) {
  const [level, setLevel] = useState(membership.notification_level)
  const { mutate: updateThread, isPending } = useUpdateThreadMembership({ threadId })

  function handleSave() {
    if (level === null) return

    updateThread(
      { notification_level: level },
      {
        onSuccess: () => {
          toast('Notification settings updated')
          onOpenChange(false)
        },
        onError: apiErrorToast
      }
    )
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange} size='sm'>
      <Dialog.Header>
        <Dialog.Title>Notification settings</Dialog.Title>
        <Dialog.Description>Choose when you want to be notified about new messages in this chat.</Dialog.Description>
      </Dialog.Header>

      <div className='px-4 pb-6'>
        <RadioGroup
          aria-label='Notification settings'
          value={level}
          className='flex flex-col gap-3'
          onValueChange={(value) => setLevel(value as MessageThreadMembership['notification_level'])}
        >
          <RadioGroupItem id='all' value='all'>
            <UIText weight='font-medium'>All new messages</UIText>
          </RadioGroupItem>
          <RadioGroupItem id='mentions' value='mentions'>
            <UIText weight='font-medium'>Mentions and replies</UIText>
          </RadioGroupItem>
          <RadioGroupItem id='none' value='none'>
            <UIText weight='font-medium'>Off</UIText>
          </RadioGroupItem>
        </RadioGroup>
      </div>

      <Dialog.Footer>
        <Dialog.TrailingActions>
          <Button variant='flat' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant='primary' onClick={handleSave} disabled={isPending}>
            Save
          </Button>
        </Dialog.TrailingActions>
      </Dialog.Footer>
    </Dialog.Root>
  )
}
