import { useState } from 'react'
import { Drawer as DrawerPrimitive } from 'vaul'

import { downloadFile } from '../Button'
import { ChevronRightIcon } from '../Icons'
import { Link } from '../Link'
import { UIText } from '../Text'
import { cn } from '../utils'
import { MenuHeadingType, MenuItem, MenuItemType, MenuSubType, MenuTextType } from './types'

function DrawerSeparator() {
  return (
    <hr className='relative -mx-1 my-1.5 h-px md:my-0.5 dark:bg-gray-900 dark:shadow-[0px_1px_0px_rgb(255_255_255_/_0.05)]' />
  )
}

function DrawerHeading({ item }: { item: MenuHeadingType }) {
  return (
    <div className='pointer-events-none flex w-full items-center justify-start px-4 pt-2'>
      <UIText tertiary className='line-clamp-1 flex-1 text-left' size='text-xs'>
        {item.label}
      </UIText>
    </div>
  )
}

function DrawerText({ item }: { item: MenuTextType }) {
  return (
    <div className='pointer-events-none flex w-full items-center justify-start px-4 py-2'>
      <UIText tertiary className='flex-1 text-left' size='text-base'>
        {item.label}
      </UIText>
    </div>
  )
}

interface DrawerItemProps {
  item: MenuItemType
  onClose: () => void
}

function DrawerItem({ item, onClose }: DrawerItemProps) {
  return (
    <button
      disabled={item.disabled}
      onClick={(event) => {
        onClose()
        // @ts-expect-error
        item.onSelect?.(event)
      }}
      className={cn(
        'group relative flex w-full cursor-pointer items-center justify-start gap-2.5 rounded-[5px] border-none px-4 font-medium outline-none disabled:cursor-not-allowed disabled:opacity-50',
        'md:h-8.5 h-10.5 text-base md:text-sm'
      )}
    >
      {item.leftSlot && <span className='initial:text-neutral-400 scale-125 transition-colors'>{item.leftSlot}</span>}
      <span className='line-clamp-1 flex-1 text-left'>{item.label}</span>
      {item.rightSlot && <span className='flex flex-none'>{item.rightSlot}</span>}

      {item.url && (
        <Link
          href={item.url}
          target={item.external ? '_blank' : '_self'}
          onClick={async (e) => {
            if (!item.url || !item.download_as) return
            e.preventDefault()

            await downloadFile(item.url, item.download_as)
          }}
          rel={item.external ? 'noopener noreferrer' : ''}
          className='absolute inset-0 z-[1]'
        />
      )}
    </button>
  )
}

interface DrawerSubItemProps {
  item: MenuSubType
  onClose: () => void
}

function DrawerSubItem({ item, onClose }: DrawerSubItemProps) {
  const [open, onOpenChange] = useState(false)

  const handleClose = () => {
    onClose()
    onOpenChange(false)
  }

  return (
    <DrawerPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DrawerPrimitive.Trigger
        disabled={item.disabled}
        className={cn(
          'group relative flex w-full cursor-pointer items-center justify-start gap-2.5 rounded-[5px] border-none px-4 font-medium outline-none disabled:cursor-not-allowed disabled:opacity-50',
          'md:h-8.5 h-10.5 text-base md:text-sm'
        )}
      >
        {item.leftSlot && <span className='initial:text-neutral-400 scale-125 transition-colors'>{item.leftSlot}</span>}
        <span className='line-clamp-1 flex-1 text-left'>{item.label}</span>
        <span className='text-quaternary -mr-2 flex flex-none'>
          <ChevronRightIcon size={28} />
        </span>
      </DrawerPrimitive.Trigger>
      <DrawerActions items={item.items} onClose={handleClose} />
    </DrawerPrimitive.Root>
  )
}

interface DrawerActionsProps {
  items: MenuItem[]
  onClose: () => void
  header?: React.ReactNode
}

function DrawerActions({ items, onClose, header }: DrawerActionsProps) {
  return (
    <DrawerPrimitive.Portal>
      <div className='relative isolate z-50'>
        <DrawerPrimitive.Overlay className='fixed inset-0 bg-black/50' />
        <DrawerPrimitive.Content
          className={cn(
            'bg-elevated text-secondary flex max-h-[95dvh] flex-col rounded-t-xl',
            'focus:outline-none',
            'fixed inset-x-0 bottom-0'
          )}
        >
          {/* Handle */}
          <div className='flex w-full cursor-grab justify-center p-3 py-2'>
            <DrawerPrimitive.Handle className='!h-1 !w-8 !rounded-full !bg-[--text-primary] !opacity-20' />
          </div>

          <div className='scrollbar-hide pb-safe-offset-1 relative overflow-y-auto overflow-x-hidden'>
            {header}

            {items.map((item, i) => {
              // eslint-disable-next-line react/no-array-index-key
              if ('separator' in item) return <DrawerSeparator key={i} />

              // eslint-disable-next-line react/no-array-index-key
              if (item.type === 'separator') return <DrawerSeparator key={i} />

              if (item.type === 'sub') {
                return (
                  // eslint-disable-next-line react/no-array-index-key
                  <DrawerSubItem key={i} item={item} onClose={onClose} />
                )
              }

              // eslint-disable-next-line react/no-array-index-key
              if (item.type === 'heading') return <DrawerHeading key={i} item={item} />

              // eslint-disable-next-line react/no-array-index-key
              if (item.type === 'text') return <DrawerText key={i} item={item} />

              return (
                // eslint-disable-next-line react/no-array-index-key
                <DrawerItem key={i} item={item} onClose={onClose} />
              )
            })}
          </div>
        </DrawerPrimitive.Content>
      </div>
    </DrawerPrimitive.Portal>
  )
}

interface MobileDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  trigger: React.ReactNode
  disabled?: boolean
  items: MenuItem[]
  header: React.ReactNode
}

export function MobileDrawerMenu({ open, onOpenChange, trigger, disabled, items, header }: MobileDrawerProps) {
  return (
    <DrawerPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DrawerPrimitive.Trigger asChild disabled={disabled}>
        {trigger}
      </DrawerPrimitive.Trigger>

      <DrawerActions items={items} onClose={() => onOpenChange(false)} header={header} />
    </DrawerPrimitive.Root>
  )
}
