import * as React from 'react'
import { isMobile } from 'react-device-detect'

import { Command as CommandPrimitive, useCommand } from '../Command'
import { Modality, useActiveModality } from '../hooks/useActiveModality'
import { cn } from '../utils'

export const highlightedCommandItemStyles = ({
  modality,
  disablePointerSelection
}: {
  modality?: Modality
  disablePointerSelection?: boolean
} = {}) =>
  cn(
    'text-primary scroll-m-1 flex cursor-pointer select-none items-center rounded-lg px-2 text-[15px] outline-none ease-in-out will-change-[background,_color]',
    {
      'transition-all ease-out duration-150': modality === 'cursor',
      'hover:bg-black/[0.025] group-hover:bg-black/[0.025] hover:dark:bg-white/5 group-hover:dark:bg-white/5':
        disablePointerSelection,
      'aria-selected:bg-black/[0.04] aria-selected:dark:shadow-select-item aria-disabled:active:cursor-not-allowed aria-selected:active:bg-white/10 aria-selected:dark:bg-white/10 data-[state=open]:bg-black/[0.04] data-[state=open]:dark:bg-white/10':
        !isMobile
    }
  )

export const HighlightedCommandItem = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({ className, ...props }, ref) => {
  const { activeModality } = useActiveModality()
  const context = useCommand()

  return (
    <CommandPrimitive.Item
      ref={ref}
      className={cn(
        highlightedCommandItemStyles({
          modality: activeModality,
          disablePointerSelection: !!context?.getDisablePointerSelection()
        }),
        className
      )}
      {...props}
    />
  )
})

HighlightedCommandItem.displayName = 'HighlightedCommandItem'
