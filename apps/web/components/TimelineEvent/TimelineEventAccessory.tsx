import { Slot } from '@radix-ui/react-slot'

import { cn } from '@campsite/ui/utils'

interface TimelineEventAccessoryProps extends React.PropsWithChildren {
  className?: string
}

function TimelineEventAccessory({ children, className }: TimelineEventAccessoryProps) {
  return (
    <div className='flex aspect-square size-6 flex-none items-center justify-center'>
      <Slot className={cn('text-tertiary aspect-square size-5 shrink-0', className)}>{children}</Slot>
    </div>
  )
}

export { TimelineEventAccessory }
