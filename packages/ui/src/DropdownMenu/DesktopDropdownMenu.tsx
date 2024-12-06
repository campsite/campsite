import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'

import { downloadFile } from '../Button'
import { DismissibleLayer } from '../DismissibleLayer'
import { ChevronRightIcon } from '../Icons'
import { KeyboardShortcut } from '../KeyboardShortcut'
import { Link } from '../Link'
import { MenuHeadingType, MenuItem, MenuItemType, MenuSubType, MenuTextType, MenuWidth } from '../Menu/types'
import { UIText } from '../Text'
import { cn, CONTAINER_STYLES } from '../utils'

interface DropdownMenuPortalProps
  extends Pick<DropdownMenuPrimitive.DropdownMenuPortalProps, 'children' | 'container'> {}

function DropdownMenuPortal({ children, ...rest }: DropdownMenuPortalProps) {
  return <DropdownMenuPrimitive.Portal {...rest}>{children}</DropdownMenuPrimitive.Portal>
}

function DropdownMenuSeparator() {
  return (
    <DropdownMenuPrimitive.Separator className='bg-tertiary relative -mx-1 my-1.5 h-px md:my-1 dark:bg-gray-900 dark:shadow-[0px_1px_0px_rgb(255_255_255_/_0.05)]' />
  )
}

function DropdownMenuHeading({ item }: { item: MenuHeadingType }) {
  return (
    <div className='pointer-events-none flex w-full items-center justify-start px-3 pb-1 pt-2'>
      <UIText tertiary className='line-clamp-1 flex-1 text-left' size='text-xs'>
        {item.label}
      </UIText>
    </div>
  )
}

function DropdownMenuText({ item }: { item: MenuTextType }) {
  return (
    <div className='pointer-events-none flex w-full items-center justify-start px-3 pb-1 pt-2'>
      <UIText tertiary className='flex-1 text-left' size='text-xs'>
        {item.label}
      </UIText>
    </div>
  )
}

interface DropdownMenuItemProps {
  item: MenuItemType
}

function DropdownMenuItem({ item }: DropdownMenuItemProps) {
  return (
    <DropdownMenuPrimitive.Item
      disabled={item.disabled}
      onMouseOver={() => item.onMouseOver?.()}
      onSelect={item.onSelect}
      className={cn(
        'group relative flex cursor-pointer items-center rounded-[5px] border-none outline-none',
        'md:h-8.5 h-10.5 text-base md:text-sm',
        'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50',
        'data-[highlighted]:dark:shadow-select-item',
        {
          'pl-1.5': item.leftSlot,
          'pl-2.5': !item.leftSlot,
          'pr-2': item.rightSlot && !item.kbd,
          'pr-1.5': item.kbd && !item.rightSlot,
          'pr-3': !item.rightSlot && !item.kbd,
          'data-[highlighted]:bg-red-500 data-[highlighted]:text-white': item.destructive,
          'data-[highlighted]:bg-black/5 data-[highlighted]:dark:bg-white/10': !item.destructive
        },
        item.className
      )}
    >
      <div className='relative flex flex-1 transform-gpu items-center gap-2'>
        {item.leftSlot && (
          <span
            className={cn('initial:text-tertiary flex-none transition-colors', {
              'group-[[data-highlighted]]:text-primary group-[[data-highlighted]]:dark': item.destructive
            })}
          >
            {item.leftSlot}
          </span>
        )}
        <span className='line-clamp-1 flex-1'>{item.label}</span>
        {item.rightSlot && <span className='flex flex-none'>{item.rightSlot}</span>}
        {item.kbd && <KeyboardShortcut shortcut={item.kbd} />}
      </div>
      {item.url && (
        <Link
          href={item.url}
          target={item.external ? '_blank' : '_self'}
          onClick={async (e) => {
            // @ts-expect-error
            item.onSelect?.(e)

            if (!item.url || !item.download_as) return
            e.preventDefault()

            await downloadFile(item.url, item.download_as)
          }}
          rel={item.external ? 'noopener noreferrer' : ''}
          className='absolute inset-0 z-[1]'
        />
      )}
    </DropdownMenuPrimitive.Item>
  )
}

interface DropdownMenuSubItemProps extends React.PropsWithChildren {
  item: MenuSubType
  width?: MenuWidth
}

function DropdownMenuSubItem({ children, item, width }: DropdownMenuSubItemProps) {
  return (
    <DropdownMenuPrimitive.Sub>
      <DropdownMenuPrimitive.SubTrigger
        className={cn(
          'group relative flex cursor-pointer items-center rounded-[5px] border-none pr-3 outline-none',
          'md:h-8.5 h-10.5 text-base md:text-sm',
          'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50',
          'data-[highlighted]:bg-black/5 data-[highlighted]:dark:bg-white/10',
          'data-[highlighted]:dark:shadow-select-item',
          {
            'pl-1.5': item.leftSlot,
            'pl-2.5': !item.leftSlot
          }
        )}
        disabled={item.disabled}
      >
        <div className='relative flex flex-1 transform-gpu items-center gap-2'>
          {item.leftSlot && <span className='initial:text-tertiary flex-none transition-colors'>{item.leftSlot}</span>}
          <span className='line-clamp-1 flex-1'>{item.label}</span>

          <span className='text-secondary -mr-2 flex flex-none'>
            <ChevronRightIcon />
          </span>
        </div>
      </DropdownMenuPrimitive.SubTrigger>

      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.SubContent
          className={cn(
            'text-primary bg-elevated dark:border-primary-opaque rounded-lg border border-neutral-400/40 p-1 shadow-md dark:shadow-[0px_0px_0px_0.5px_rgba(0,0,0,1),_0px_4px_4px_rgba(0,0,0,0.24)]',
            width
          )}
          collisionPadding={8}
        >
          {children}
        </DropdownMenuPrimitive.SubContent>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Sub>
  )
}

interface DropdownMenuActionsProps {
  items: MenuItem[]
  width?: MenuWidth
}

function DropdownMenuActions({ items, width }: DropdownMenuActionsProps) {
  return items.map((item, i) => {
    // eslint-disable-next-line react/no-array-index-key
    if (item.type === 'separator') return <DropdownMenuSeparator key={i} />

    // eslint-disable-next-line react/no-array-index-key
    if (item.type === 'heading') return <DropdownMenuHeading key={i} item={item} />

    // eslint-disable-next-line react/no-array-index-key
    if (item.type === 'text') return <DropdownMenuText key={i} item={item} />

    if (item.type === 'sub') {
      return (
        // eslint-disable-next-line react/no-array-index-key
        <DropdownMenuSubItem key={i} item={item} width={width}>
          <DropdownMenuActions items={item.items} />
        </DropdownMenuSubItem>
      )
    }

    return (
      // eslint-disable-next-line react/no-array-index-key
      <DropdownMenuItem key={i} item={item} />
    )
  })
}

interface DropdownMenuProps {
  align: 'start' | 'end' | 'center'
  side?: 'top' | 'bottom'
  sideOffset?: number
  open?: boolean
  onOpenChange?: (open: boolean) => void
  trigger: React.ReactNode
  disabled?: boolean
  items: MenuItem[]
  header?: React.ReactNode
  width?: MenuWidth
  container?: HTMLElement | null
  modal?: boolean
}

export function DesktopDropdownMenu({
  align,
  side,
  sideOffset,
  open,
  onOpenChange,
  trigger,
  disabled,
  items,
  header,
  width = 'w-[220px]',
  container,
  modal
}: DropdownMenuProps) {
  return (
    <DropdownMenuPrimitive.Root open={open} onOpenChange={onOpenChange} modal={modal}>
      <DropdownMenuPrimitive.Trigger asChild disabled={disabled}>
        {trigger}
      </DropdownMenuPrimitive.Trigger>

      <DropdownMenuPortal container={container}>
        <DropdownMenuPrimitive.Content
          sideOffset={sideOffset}
          align={align}
          side={side}
          collisionPadding={8}
          // Do not let pointer move events escape the dropdown. Other controls like Command rely on onPointerMove while
          // embedding the dropdown in the component. This results in a flickering effect when the pointer is moved in
          // the dropdown.
          onPointerMove={(e) => e.stopPropagation()}
          className={cn(
            'focus:outline-none',
            'text-primary bg-elevated dark:border-primary-opaque rounded-lg border border-neutral-400/40 p-1 shadow-md dark:shadow-[0px_0px_0px_0.5px_rgba(0,0,0,1),_0px_4px_4px_rgba(0,0,0,0.24)]',
            CONTAINER_STYLES.animation,
            width
          )}
        >
          <DismissibleLayer>
            <div className='contents'>
              {header}

              <DropdownMenuActions items={items} width={width} />
            </div>
          </DismissibleLayer>
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPortal>
    </DropdownMenuPrimitive.Root>
  )
}
