import { useState } from 'react'

import { Button, PlusIcon } from '@campsite/ui'

import { CreateCustomReactionDialog } from './CreateCustomReactionDialog'

export function CreateCustomReaction() {
  const [dialogIsOpen, setDialogIsOpen] = useState(false)

  return (
    <>
      <CreateCustomReactionDialog open={dialogIsOpen} onOpenChange={setDialogIsOpen} />
      <Button leftSlot={<PlusIcon />} onClick={() => setDialogIsOpen(true)}>
        New
      </Button>
    </>
  )
}
