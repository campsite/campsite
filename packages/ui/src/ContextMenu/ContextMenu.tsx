import * as ContextMenuPrimitive from '@radix-ui/react-context-menu'

import { downloadFile } from '../Button'
import { DismissibleLayer } from '../DismissibleLayer'
import { ChevronRightIcon } from '../Icons'
import { KeyboardShortcut } from '../KeyboardShortcut'
import { MenuItem } from '../Menu'
import { MenuHeadingType, MenuItemType, MenuSubType, MenuTextType, MenuWidth } from '../Menu/types'
import { cn, CONTAINER_STYLES } from '../utils'

function ContextMenuSeparator() {
  return <ContextMenuPrimitive.Separator className='-mx-1 my-1 h-0 border-b border-t dark:border-t-black/70' />
}

function ContextMenuHeading({ item }: { item: MenuHeadingType }) {
  return (
    <ContextMenuPrimitive.Label className='text-tertiary dark:text-secondary pl-1.5 pt-1 text-[10px] font-medium uppercase'>
      {item.label}
    </ContextMenuPrimitive.Label>
  )
}

function ContextMenuText({ item }: { item: MenuTextType }) {
  return (
    <ContextMenuPrimitive.Label className='text-tertiary dark:text-secondary pl-1.5 pt-1 text-[10px] font-medium'>
      {item.label}
    </ContextMenuPrimitive.Label>
  )
}

interface ContextMenuItemProps {
  item: MenuItemType
}

function ContextMenuItem({ item }: ContextMenuItemProps) {
  return (
    <ContextMenuPrimitive.Item
      disabled={item.disabled}
      onSelect={async (event) => {
        if (item.onSelect) {
          item.onSelect(event)
        } else if (item.url) {
          if (item.download_as) {
            await downloadFile(item.url, item.download_as)
          } else {
            window.open(item.url, '_blank')
          }
        }
      }}
      className={cn(
        'text-primary data-[highlighted]:bg-quaternary dark:data-[highlighted]:shadow-select-item group flex h-8 cursor-pointer items-center gap-1.5 rounded-md !border-0 text-sm !ring-0 focus-visible:!border-0 focus-visible:!outline-none focus-visible:!ring-0',
        {
          'data-[highlighted]:bg-red-500 data-[highlighted]:text-white': item.destructive,
          'pl-1.5': item.leftSlot,
          'pl-2.5': !item.leftSlot,
          'pr-2': item.rightSlot && !item.kbd,
          'pr-1.5': item.kbd && !item.rightSlot,
          'pr-3': !item.rightSlot && !item.kbd
        }
      )}
    >
      {item.leftSlot && (
        <span
          className={cn('text-tertiary flex-none', {
            'group-[[data-highlighted]]:text-primary group-[[data-highlighted]]:dark': item.destructive
          })}
        >
          {item.leftSlot}
        </span>
      )}
      <ContextMenuPrimitive.Label className='flex-1 pr-4'>{item.label}</ContextMenuPrimitive.Label>
      {item.rightSlot && <span className='flex flex-none'>{item.rightSlot}</span>}
      {item.kbd && <KeyboardShortcut shortcut={item.kbd} />}
    </ContextMenuPrimitive.Item>
  )
}

interface ContextSubItemProps extends React.PropsWithChildren {
  item: MenuSubType
  width?: MenuWidth
}

function ContextSubItem({ children, item, width }: ContextSubItemProps) {
  return (
    <ContextMenuPrimitive.Sub>
      <ContextMenuPrimitive.SubTrigger className='text-primary data-[highlighted]:bg-quaternary dark:data-[highlighted]:shadow-select-item flex h-8 cursor-pointer items-center gap-1.5 rounded-md !border-0 pl-1.5 pr-1 !ring-0 focus-visible:!border-0 focus-visible:!outline-none focus-visible:!ring-0'>
        {item.leftSlot && <span className='text-tertiary'>{item.leftSlot}</span>}
        <ContextMenuPrimitive.Label className='flex-1 text-sm'>{item.label}</ContextMenuPrimitive.Label>
        <ChevronRightIcon />
      </ContextMenuPrimitive.SubTrigger>
      <ContextMenuPrimitive.Portal>
        <ContextMenuPrimitive.SubContent
          sideOffset={4}
          alignOffset={-4}
          className={cn(
            'bg-elevated dark:border-primary-opaque max-h-[--radix-context-menu-content-available-height] min-w-[--radix-context-menu-trigger-width] origin-[--radix-context-menu-content-transform-origin] overflow-y-auto rounded-lg border border-neutral-400/40 p-1 shadow-md dark:shadow-[0px_0px_0px_0.5px_rgba(0,0,0,1),_0px_4px_4px_rgba(0,0,0,0.24)]',
            width
          )}
        >
          {children}
        </ContextMenuPrimitive.SubContent>
      </ContextMenuPrimitive.Portal>
    </ContextMenuPrimitive.Sub>
  )
}

interface ContextMenuActionsProps {
  items: MenuItem[]
  width?: MenuWidth
}

function ContextMenuActions({ items, width }: ContextMenuActionsProps) {
  return items.map((item, i) => {
    // eslint-disable-next-line react/no-array-index-key
    if (item.type === 'separator') return <ContextMenuSeparator key={i} />

    // eslint-disable-next-line react/no-array-index-key
    if (item.type === 'heading') return <ContextMenuHeading key={i} item={item} />

    if (item.type === 'sub') {
      return (
        // eslint-disable-next-line react/no-array-index-key
        <ContextSubItem key={i} item={item} width={width}>
          <ContextMenuActions items={item.items} />
        </ContextSubItem>
      )
    }

    // eslint-disable-next-line react/no-array-index-key
    if (item.type === 'text') return <ContextMenuText key={i} item={item} />

    // eslint-disable-next-line react/no-array-index-key
    return <ContextMenuItem key={i} item={item} />
  })
}

interface ContextMenuProps extends React.PropsWithChildren {
  items: MenuItem[]
  onOpenChange?: (open: boolean) => void
  asChild?: boolean
}

export function ContextMenu({ children, items, onOpenChange, asChild }: ContextMenuProps) {
  return (
    <ContextMenuPrimitive.Root onOpenChange={onOpenChange}>
      <ContextMenuPrimitive.Trigger asChild={asChild}>{children}</ContextMenuPrimitive.Trigger>
      <ContextMenuPrimitive.Portal>
        <DismissibleLayer>
          <ContextMenuPrimitive.Content
            collisionPadding={8}
            alignOffset={4}
            className={cn(
              'focus:outline-none',
              'max-h-[--radix-context-menu-content-available-height] min-w-[--radix-context-menu-trigger-width]',
              'bg-elevated dark:border-primary-opaque overflow-y-auto rounded-lg border border-neutral-400/40 p-1 shadow dark:shadow-[0px_0px_0px_0.5px_rgba(0,0,0,1),_0px_4px_4px_rgba(0,0,0,0.24)]',
              CONTAINER_STYLES.animation
            )}
          >
            <ContextMenuActions items={items} />
          </ContextMenuPrimitive.Content>
        </DismissibleLayer>
      </ContextMenuPrimitive.Portal>
    </ContextMenuPrimitive.Root>
  )
}
