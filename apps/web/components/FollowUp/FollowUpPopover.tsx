import { useState } from 'react'

import { SubjectFollowUp } from '@campsite/types'
import { cn, CONTAINER_STYLES, Popover, PopoverContent, PopoverPortal, PopoverTrigger } from '@campsite/ui'

import { FollowUps } from '@/components/FollowUp/FollowUps'

interface FollowUpPopoverProps extends React.PropsWithChildren {
  followUps: SubjectFollowUp[]
  side?: 'top' | 'left' | 'right' | 'bottom'
  align?: 'start' | 'center' | 'end'
  modal?: boolean
}

export function FollowUpPopover({
  followUps,
  children,
  side = 'bottom',
  align = 'end',
  modal = false
}: FollowUpPopoverProps) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen} modal={modal}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverPortal>
        <PopoverContent
          side={side}
          align={align}
          sideOffset={8}
          onCloseAutoFocus={(event) => event.preventDefault()}
          className={cn(
            'w-[320px]',
            CONTAINER_STYLES.shadows,
            'bg-elevated rounded-lg dark:border dark:bg-clip-border',
            'scrollbar-hide flex max-h-[400px] flex-col gap-0.5 overflow-y-scroll'
          )}
        >
          <FollowUps followUps={followUps} />
        </PopoverContent>
      </PopoverPortal>
    </Popover>
  )
}
