import { useEffect, useState } from 'react'
import { isMobile } from 'react-device-detect'

import { Note } from '@campsite/types'
import { CONTAINER_STYLES, Popover, PopoverContent, PopoverPortal, PopoverTrigger } from '@campsite/ui'
import { cn } from '@campsite/ui/src/utils'

import { NoteComments } from '.'

interface Props {
  note: Note
  side?: 'left' | 'right' | 'top' | 'bottom'
  align?: 'start' | 'end' | 'center'
  children: React.ReactNode
}

export function NoteCommentsPopover({ children, note, side = 'bottom', align = 'end' }: Props) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const hash = window.location.hash

    if (!hash?.startsWith('#comment') || isMobile) return
    setOpen(true)
  }, [])

  return (
    <Popover open={open} onOpenChange={setOpen} modal={isMobile}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverPortal>
        <PopoverContent
          onOpenAutoFocus={(e) => e.preventDefault()}
          asChild
          side={side}
          align={align}
          className={cn(
            CONTAINER_STYLES.base,
            CONTAINER_STYLES.shadows,
            CONTAINER_STYLES.rounded,
            'max-h-[calc(var(--radix-popper-available-height)-0.5rem)] min-h-[400px]',
            '4xl:max-w-[500px] 4xl:w-[500px] w-[420px] lg:max-w-[420px]',
            'text-primary bg-elevated flex flex-none flex-col overflow-hidden border border-t lg:border-l lg:border-t-0 dark:border dark:border-black/50 dark:ring-1 dark:ring-gray-700/50'
          )}
        >
          <NoteComments note={note} />
        </PopoverContent>
      </PopoverPortal>
    </Popover>
  )
}
