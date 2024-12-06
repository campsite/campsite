import { HTMLProps, useRef } from 'react'

import { cn } from '@campsite/ui/src/utils'

import { useScrollRestoration } from '@/hooks/useScrollRestoration'

export type ScrollableContainerProps = HTMLProps<HTMLDivElement> & {
  disableScrollRestoration?: boolean
  disableStableGutter?: boolean
}

/**
 * A scrollable container that can be used to wrap content that should be scrollable.
 * This component should be used as the primary scroll container in the app.
 */
export function ScrollableContainer({
  className,
  children,
  disableScrollRestoration = false,
  disableStableGutter = false,
  ...props
}: ScrollableContainerProps) {
  const ref = useRef<HTMLDivElement>(null)

  useScrollRestoration(ref, { enabled: !disableScrollRestoration })

  return (
    <div
      ref={ref}
      className={cn(
        'flex w-full flex-1 flex-col overflow-y-auto',
        'focus:outline-none focus:ring-0',
        !disableStableGutter && '[scrollbar-gutter:stable]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

ScrollableContainer.displayName = 'ScrollableContainer'
