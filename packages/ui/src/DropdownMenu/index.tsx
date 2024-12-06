import { useState } from 'react'

import { useBreakpoint } from '../hooks'
import { MenuItem, MenuWidth, MobileDrawerMenu } from '../Menu'
import { DesktopDropdownMenu } from './DesktopDropdownMenu'

export interface DropdownMenuProps {
  align: 'start' | 'end' | 'center'
  side?: 'top' | 'bottom'
  sideOffset?: number
  items: MenuItem[]
  trigger: React.ReactNode
  disabled?: boolean
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  header?: React.ReactNode
  desktop?: {
    width?: MenuWidth
    container?: HTMLElement | null
    modal?: boolean
  }
}

export const DropdownMenu = ({
  align,
  side = 'bottom',
  sideOffset = 8,
  disabled,
  items,
  trigger,
  onOpenChange,
  defaultOpen = false,
  open: propsOpen,
  header,
  desktop
}: DropdownMenuProps) => {
  const isDesktop = useBreakpoint('lg')
  const [_open, _setOpen] = useState(defaultOpen)
  const open = propsOpen ?? _open
  const setOpen = (open: boolean) => {
    _setOpen(open)
    onOpenChange?.(open)
  }

  if (isDesktop) {
    return (
      <DesktopDropdownMenu
        align={align}
        side={side}
        sideOffset={sideOffset}
        open={open}
        onOpenChange={setOpen}
        trigger={trigger}
        disabled={disabled}
        items={items}
        header={header}
        {...desktop}
      />
    )
  }

  return (
    <MobileDrawerMenu
      open={open}
      onOpenChange={setOpen}
      trigger={trigger}
      disabled={disabled}
      items={items}
      header={header}
    />
  )
}
