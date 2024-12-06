import { useState } from 'react'

import { Note } from '@campsite/types'
import { CONTAINER_STYLES, Popover, PopoverContent, PopoverPortal, PopoverTrigger } from '@campsite/ui'
import { cn } from '@campsite/ui/src/utils'

import { NoteShareContent } from '@/components/NoteSharePopover/NoteShareContent'

interface NoteSharePopoverProps extends React.PropsWithChildren {
  note: Note
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
  modal?: boolean
}

export function NoteSharePopover({
  note,
  children,
  side = 'bottom',
  align = 'end',
  modal = true
}: NoteSharePopoverProps) {
  const [open, onOpenChange] = useState(false)

  return (
    <Popover open={open} onOpenChange={(val) => onOpenChange(val)} modal={modal}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverPortal>
        <PopoverContent
          avoidCollisions
          asChild
          side={side}
          align={align}
          sideOffset={8}
          className={cn(
            'w-[440px]',
            CONTAINER_STYLES.base,
            CONTAINER_STYLES.shadows,
            'bg-elevated rounded-lg border bg-clip-border'
          )}
          onKeyDownCapture={(evt) => {
            // Temporary fix: prevent close when focused on react-select input
            if (evt.key === 'Escape' && document.activeElement instanceof HTMLInputElement) {
              evt.preventDefault()
            }
          }}
          onBlurCapture={(evt) => evt.preventDefault()}
        >
          <NoteShareContent note={note} open={open} onOpenChange={onOpenChange} />
        </PopoverContent>
      </PopoverPortal>
    </Popover>
  )
}
