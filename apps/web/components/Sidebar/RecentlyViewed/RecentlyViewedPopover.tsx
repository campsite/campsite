import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useAtomValue } from 'jotai'

import {
  Button,
  ClockIcon,
  Command,
  LayeredHotkeys,
  Popover,
  PopoverContent,
  PopoverPortal,
  PopoverTrigger,
  UIText,
  useIsDesktopApp
} from '@campsite/ui'

import {
  RecentlyViewedCall,
  RecentlyViewedNote,
  RecentlyViewedPost
} from '@/components/Sidebar/RecentlyViewed/RecentlyViewedItem'
import { useScope } from '@/contexts/scope'

import { recentlyViewedAtom } from './utils'

const SHORTCUT = 'mod+y'

export function RecentlyViewedPopover() {
  const [open, setOpen] = useState(false)
  const isDesktop = useIsDesktopApp()

  if (!isDesktop) return null

  return (
    <>
      {isDesktop && <LayeredHotkeys keys={SHORTCUT} callback={() => setOpen((prev) => !prev)} />}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={open ? 'flat' : 'plain'}
            iconOnly={<ClockIcon />}
            accessibilityLabel='Recently viewed'
            tooltip='Recently viewed'
            tooltipShortcut={isDesktop ? 'mod+y' : undefined}
            onClick={() => setOpen((prev) => !prev)}
          />
        </PopoverTrigger>
        <AnimatePresence>
          {open && (
            <PopoverPortal>
              <PopoverContent
                className='animate-scale-fade shadow-popover dark:border-primary-opaque bg-primary relative flex w-[420px] flex-1 origin-[--radix-hover-card-content-transform-origin] flex-col overflow-hidden rounded-lg border border-transparent dark:shadow-[0px_2px_16px_rgba(0,0,0,1)]'
                asChild
                forceMount
                side='bottom'
                align='start'
                sideOffset={4}
                onCloseAutoFocus={(event) => event.preventDefault()}
                addDismissibleLayer
              >
                <div className='flex h-11 w-full flex-none items-center justify-between gap-3 border-b px-3'>
                  <UIText weight='font-semibold'>Recent</UIText>
                </div>

                <RecentlyViewedPopoverContent onClose={() => setOpen(false)} />
              </PopoverContent>
            </PopoverPortal>
          )}
        </AnimatePresence>
      </Popover>
    </>
  )
}

function RecentlyViewedPopoverContent({ onClose }: { onClose: () => void }) {
  const { scope } = useScope()
  const recentlyViewed = useAtomValue(recentlyViewedAtom(`${scope}`))
  const isDesktop = useIsDesktopApp()

  return (
    <>
      {isDesktop && (
        <LayeredHotkeys
          // register this inside the popover layer so it can be closed with the same shortcut
          keys={SHORTCUT}
          callback={onClose}
        />
      )}

      <Command
        autoFocus
        className='flex flex-1 flex-col ring-0 focus-visible:border-0 focus-visible:outline-none focus-visible:ring-0'
        loop
        tabIndex={0}
      >
        <Command.List className='scrollbar-hide overflow-y-auto'>
          <Command.Group className='p-1.5'>
            <Command.Empty className='flex h-full w-full flex-1 flex-col items-center justify-center gap-1 p-8'>
              <ClockIcon className='text-quaternary opacity-50' size={48} />
            </Command.Empty>
            {recentlyViewed.map(({ post, call, note }) => {
              if (post) {
                return <RecentlyViewedPost key={post.id} onSelect={onClose} post={post} />
              } else if (note) {
                return <RecentlyViewedNote key={note.id} onSelect={onClose} note={note} />
              } else if (call) {
                return <RecentlyViewedCall key={call.id} onSelect={onClose} call={call} />
              } else {
                return null
              }
            })}
          </Command.Group>
        </Command.List>
      </Command>
    </>
  )
}
