import React, { useCallback, useEffect, useRef, useState } from 'react'
import { isMobile } from 'react-device-detect'
import { Drawer } from 'vaul'

import { SyncCustomReaction } from '@campsite/types'
import {
  CONTAINER_STYLES,
  DismissibleLayer,
  Popover,
  PopoverContent,
  PopoverPortal as PopoverPortalPrimitive,
  PopoverTrigger,
  useBreakpoint,
  useControllableState
} from '@campsite/ui'
import { cn } from '@campsite/ui/src/utils'

import { useEmojiMartData } from '@/hooks/reactions/useEmojiMartData'
import { useSyncedCustomReactions } from '@/hooks/useSyncedCustomReactions'
import { StandardReaction } from '@/utils/reactions'

import { DesktopReactionPicker } from './DesktopReactionPicker'
import { MobileReactionPicker } from './MobileReactionPicker'

const COLLISION_PADDING = 16
const SIDE_OFFSET = 4

function DrawerOverlay() {
  return <Drawer.Overlay className='fixed inset-0 bg-black/50' />
}

interface ReactionPickerProps {
  open?: boolean
  onOpenChange?: (value: boolean) => void
  onClose?: () => void
  onReactionSelect: (emoji: StandardReaction | SyncCustomReaction) => void
  trigger: React.ReactNode
  custom?: boolean
  modal?: boolean
  align?: 'start' | 'center' | 'end'
}

export function ReactionPicker({
  onReactionSelect,
  trigger,
  custom: showCustomReactions,
  onClose,
  open: openProp,
  onOpenChange: onOpenChangeProp,
  modal = true,
  align
}: ReactionPickerProps) {
  const { data } = useEmojiMartData()
  const { customReactions } = useSyncedCustomReactions()
  const [open, setOpen] = useControllableState({ prop: openProp, onChange: onOpenChangeProp })
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [triggerRect, setTriggerRect] = useState<{ top: number; bottom: number }>({ top: 0, bottom: 0 })

  const onOpenChange = useCallback(
    (value: boolean) => {
      setOpen(value)
      if (!value) {
        // HACK: Blur the dialog so that the focus is returned to the document body
        ;(document.activeElement as HTMLElement)?.blur()
      }
    },
    [setOpen]
  )

  const handleReactionSelect = (emoji: { id: string; name: string; native?: string }) => {
    const customReaction = customReactions?.find((reaction) => reaction.id === emoji.id)

    if (customReaction) {
      onReactionSelect(customReaction)
    } else if (emoji.native) {
      onReactionSelect({ id: emoji.id, name: emoji.name, native: emoji.native })
    }
    onOpenChange(false)
  }

  useEffect(() => {
    if (open) {
      const rect = triggerRef.current?.getBoundingClientRect() ?? new DOMRect()

      setTriggerRect({
        top: rect.top + COLLISION_PADDING + SIDE_OFFSET + 32,
        bottom: rect.bottom - COLLISION_PADDING - SIDE_OFFSET - 32
      })
    }
  }, [triggerRef, open])

  const isPopover = useBreakpoint('md') || !isMobile

  const Root = isPopover ? Popover : Drawer.Root
  const Trigger = isPopover ? PopoverTrigger : Drawer.Trigger
  const Portal = isPopover ? PopoverPortalPrimitive : Drawer.Portal
  const Overlay = isPopover ? React.Fragment : DrawerOverlay
  const Content = isPopover ? PopoverContent : Drawer.Content

  return (
    <Root open={open} onOpenChange={onOpenChange} modal={modal}>
      <Trigger ref={triggerRef} asChild disabled={!data}>
        {trigger}
      </Trigger>
      <Portal>
        <>
          <Overlay />
          <DismissibleLayer>
            <Content
              align={align}
              asChild={isPopover}
              onCloseAutoFocus={(e) => {
                if (!onClose) return

                e.preventDefault()
                onClose()
              }}
              {...(isPopover
                ? {
                    collisionPadding: COLLISION_PADDING,
                    side: 'bottom',
                    hideWhenDetached: true,
                    sideOffset: SIDE_OFFSET
                  }
                : {})}
              style={
                isPopover
                  ? { maxHeight: `max(calc(100dvh - ${triggerRect.top}px), calc(${triggerRect.bottom}px))` }
                  : undefined
              }
              className={cn(
                isPopover && [
                  CONTAINER_STYLES.animation,
                  CONTAINER_STYLES.rounded,
                  CONTAINER_STYLES.shadows,
                  'bg-elevated relative h-[424px] overflow-hidden border bg-clip-border dark:shadow-[0_0_0_1px_black]'
                ],
                !isPopover && 'bg-elevated fixed inset-x-0 bottom-0 rounded-t-xl focus:outline-none focus:ring-0'
              )}
            >
              {!isPopover ? (
                <MobileReactionPicker
                  showCustomReactions={showCustomReactions}
                  onReactionSelect={handleReactionSelect}
                />
              ) : (
                <DesktopReactionPicker
                  showCustomReactions={showCustomReactions}
                  onReactionSelect={handleReactionSelect}
                />
              )}
            </Content>
          </DismissibleLayer>
        </>
      </Portal>
    </Root>
  )
}
