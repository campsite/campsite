import { useState } from 'react'

import { CustomReaction } from '@campsite/types'
import { Button, TrashIcon } from '@campsite/ui'

import { DeleteCustomReactionDialog } from './DeleteCustomReactionDialog'

interface DeleteCustomReactionProps {
  customReaction: CustomReaction
}

export function DeleteCustomReaction({ customReaction }: DeleteCustomReactionProps) {
  const [dialogIsOpen, setDialogIsOpen] = useState(false)

  return (
    <>
      <DeleteCustomReactionDialog open={dialogIsOpen} onOpenChange={setDialogIsOpen} customReaction={customReaction} />
      <Button
        variant='plain'
        iconOnly={<TrashIcon />}
        accessibilityLabel='Delete Custom Reaction'
        onClick={() => setDialogIsOpen(true)}
      />
    </>
  )
}
