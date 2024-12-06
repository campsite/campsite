import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { isMobile } from 'react-device-detect'
import toast from 'react-hot-toast'
import { useDebounce } from 'use-debounce'
import { v4 as uuid } from 'uuid'
import { Drawer } from 'vaul'

import { Gif } from '@campsite/types'
import {
  CONTAINER_STYLES,
  Popover,
  PopoverContent,
  PopoverPortal as PopoverPortalPrimitive,
  PopoverTrigger,
  TextField,
  useBreakpoint,
  useControllableState
} from '@campsite/ui'
import { cn } from '@campsite/ui/src/utils'

import { InfiniteLoader } from '@/components/InfiniteLoader'
import { useDownloadGif } from '@/hooks/useDownloadGif'
import { useGetGifs } from '@/hooks/useGetGifs'
import { flattenInfiniteData } from '@/utils/flattenInfiniteData'

const COLLISION_PADDING = 16
const SIDE_OFFSET = 4

function DrawerOverlay() {
  return <Drawer.Overlay className='fixed inset-0 bg-black/50' />
}

interface GifPickerProps {
  open?: boolean
  onOpenChange?: (value: boolean) => void
  onClose?: () => void
  onGifSelect: (file: File) => void
  trigger: React.ReactNode
}

export function GifPicker({
  trigger,
  onClose,
  onGifSelect,
  open: openProp,
  onOpenChange: onOpenChangeProp
}: GifPickerProps) {
  const sessionIdRef = useRef(uuid())
  const [query, setQuery] = useState('')
  const [debouncedQuery] = useDebounce(query.trim(), 200)
  const downloadGif = useDownloadGif()
  const [open, setOpen] = useControllableState({ prop: openProp, onChange: onOpenChangeProp })
  const getGifs = useGetGifs({ q: debouncedQuery || undefined, enabled: !!open })
  const gifs = useMemo(() => flattenInfiniteData(getGifs.data), [getGifs.data])
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [triggerRect, setTriggerRect] = useState<{ top: number; bottom: number }>({ top: 0, bottom: 0 })

  const onOpenChange = useCallback(
    (value: boolean) => {
      setOpen(value)
      sessionIdRef.current = uuid()
      if (!value) {
        // HACK: Blur the dialog so that the focus is returned to the document body
        ;(document.activeElement as HTMLElement)?.blur()
      }
    },
    [setOpen]
  )

  const handleGifSelect = async (gif: Gif) => {
    onOpenChange(false)

    downloadGif.mutate(gif, {
      onSuccess: (file) => onGifSelect(file),
      onError: () => toast.error('Failed to get GIF')
    })
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
    <Root open={open} onOpenChange={onOpenChange} modal>
      <Trigger ref={triggerRef} asChild>
        {trigger}
      </Trigger>
      <Portal>
        <>
          <Overlay />
          <Content
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
            className={cn(
              isPopover && [
                CONTAINER_STYLES.animation,
                CONTAINER_STYLES.rounded,
                CONTAINER_STYLES.shadows,
                'bg-elevated relative h-[424px] overflow-hidden border bg-clip-border dark:shadow-[0_0_0_1px_black]'
              ],
              !isPopover &&
                'bg-elevated fixed inset-x-0 bottom-0 h-[424px] rounded-t-xl focus:outline-none focus:ring-0'
            )}
            style={
              isPopover
                ? { maxHeight: `max(calc(100dvh - ${triggerRect.top}px), calc(${triggerRect.bottom}px))` }
                : undefined
            }
          >
            <div className='relative isolate flex h-full flex-col overflow-hidden focus:outline-0'>
              {!isPopover && (
                <div className='mx-auto mt-2 h-1 w-8 shrink-0 rounded-full bg-[--text-primary] opacity-20' />
              )}
              <div className='bg-elevated z-20 px-2 py-2'>
                <TextField
                  value={query}
                  onChange={(value) => {
                    setQuery(value)
                  }}
                  /**
                   * Tenor Attribution Guidelines
                   *
                   * @see https://developers.google.com/tenor/guides/attribution
                   */
                  placeholder='Search Tenor'
                  additionalClasses={cn('bg-quaternary focus:bg-primary border-transparent', {
                    'h-8 rounded px-2': isPopover,
                    'h-10 rounded-lg px-3 text-base': !isPopover
                  })}
                />
              </div>
              <div className='grid grid-cols-3 gap-1 overflow-y-scroll md:w-[320px]'>
                {gifs?.map((gif) => (
                  <button className='contents' key={gif.id} onClick={() => handleGifSelect(gif)}>
                    <Image
                      unoptimized
                      className='h-fulls aspect-square w-full object-cover'
                      draggable={false}
                      src={gif.url}
                      width={gif.width}
                      height={gif.height}
                      alt={gif.description}
                    />
                  </button>
                ))}

                <div className='col-span-3'>
                  <InfiniteLoader
                    hasNextPage={!!getGifs.hasNextPage}
                    isError={!!getGifs.isError}
                    isFetching={!!getGifs.isFetching}
                    isFetchingNextPage={!!getGifs.isFetchingNextPage}
                    fetchNextPage={getGifs.fetchNextPage}
                  />
                </div>
              </div>
            </div>
          </Content>
        </>
      </Portal>
    </Root>
  )
}
