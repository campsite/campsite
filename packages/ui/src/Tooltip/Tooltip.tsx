import { useState } from 'react'
import * as Tip from '@radix-ui/react-tooltip'

import { KeyboardShortcut } from '../KeyboardShortcut'
import { cn } from '../utils'

interface Props {
  label?: string | React.ReactNode
  shortcut?: string
  children: React.ReactNode
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
  asChild?: boolean
  disableHoverableContent?: boolean
  delayDuration?: number
  hideWhenDetached?: boolean
  hideOnKeyboardFocus?: boolean
  sideOffset?: number
  alignOffset?: number
}

export function Tooltip(props: Props) {
  const {
    label,
    children,
    side = 'top',
    align = 'center',
    asChild = true,
    shortcut,
    disableHoverableContent = false,
    delayDuration = 400,
    hideWhenDetached = true,
    hideOnKeyboardFocus = true,
    sideOffset = 5,
    alignOffset = 5
  } = props
  const [open, setOpen] = useState(false)

  return (
    <Tip.Provider>
      <Tip.Root
        disableHoverableContent={disableHoverableContent}
        delayDuration={delayDuration}
        open={open}
        onOpenChange={setOpen}
      >
        <Tip.Trigger
          asChild={asChild}
          onFocus={(e) => {
            if (hideOnKeyboardFocus) {
              e.preventDefault()
            }
          }}
        >
          {children}
        </Tip.Trigger>
        <Tip.Portal>
          {(label || shortcut) && (
            <Tip.Content
              side={side}
              align={align}
              className={cn(
                'text-primary dark:bg-elevated dark pointer-events-none flex max-w-sm flex-row gap-3 break-words rounded-md bg-gray-900 py-1 text-center text-[13px] font-normal shadow-[inset_0px_0px_0px_0.5px_rgb(255_255_255_/_0.02),inset_0px_0.5px_0px_rgb(255_255_255_/_0.04),_inset_0px_0px_0px_1px_rgb(255_255_255_/_0.02),_0px_0px_0px_0.5px_rgb(0_0_0_/_0.24)]',
                {
                  'px-2': !shortcut,
                  'pl-2.5 pr-1': !!shortcut && !!label,
                  'px-1': !!shortcut && !label
                }
              )}
              collisionPadding={8}
              sideOffset={sideOffset}
              alignOffset={alignOffset}
              hideWhenDetached={hideWhenDetached}
            >
              {label}
              {shortcut && <KeyboardShortcut shortcut={shortcut} />}
            </Tip.Content>
          )}
        </Tip.Portal>
      </Tip.Root>
    </Tip.Provider>
  )
}
