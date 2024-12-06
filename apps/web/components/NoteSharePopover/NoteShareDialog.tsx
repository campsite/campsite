import { Note } from '@campsite/types'
import * as Dialog from '@campsite/ui/src/Dialog'

import { NoteShareContent } from '@/components/NoteSharePopover/NoteShareContent'

interface NoteShareDialogProps {
  note: Note
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NoteShareDialog({ note, open, onOpenChange }: NoteShareDialogProps) {
  return (
    <Dialog.Root
      size='base'
      align='top'
      open={open}
      onOpenChange={onOpenChange}
      visuallyHiddenTitle='Share this note'
      disableDescribedBy
    >
      <Dialog.Content className='overflow-visible p-0'>
        <NoteShareContent note={note} open={open} onOpenChange={onOpenChange} />
      </Dialog.Content>
    </Dialog.Root>
  )
}
