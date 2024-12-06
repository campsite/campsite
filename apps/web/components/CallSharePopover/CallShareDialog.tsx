import { Call } from '@campsite/types'
import * as Dialog from '@campsite/ui/src/Dialog'

import { CallShareContent } from '@/components/CallSharePopover/CallShareContent'

interface CallShareDialogProps {
  call: Call
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CallShareDialog({ call, open, onOpenChange }: CallShareDialogProps) {
  return (
    <Dialog.Root
      size='base'
      align='top'
      open={open}
      onOpenChange={onOpenChange}
      visuallyHiddenTitle='Share call'
      visuallyHiddenDescription='Share this call as a post or copy the link'
    >
      <Dialog.Content className='overflow-hidden p-0'>
        <CallShareContent call={call} onOpenChange={onOpenChange} />
      </Dialog.Content>
    </Dialog.Root>
  )
}
