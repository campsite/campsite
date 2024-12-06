'use client'

import * as React from 'react'
import { useRef } from 'react'

import {
  CheckIcon,
  cn,
  ConditionalWrap,
  KeyboardShortcut,
  Popover,
  PopoverContent,
  PopoverPortal,
  PopoverTrigger,
  UIText
} from '../'
import {
  SelectCommandContainer,
  SelectCommandEmpty,
  SelectCommandGroup,
  SelectCommandInput,
  SelectCommandItem,
  SelectCommandList,
  SelectCommandLoading,
  SelectCommandSeparator
} from './SelectCommand'

export interface SelectOption {
  label: string
  value: string
  leftSlot?: React.ReactNode
  sublabel?: string
  badge?: React.ReactNode
  shortcut?: string[]
}

interface Props<T> {
  open: boolean
  setOpen: (open: boolean) => void
  children: React.ReactNode
  options: readonly T[]
  query?: string
  onQueryChange?: (value: string) => void
  onOpenChange?: (open: boolean) => void
  typeAhead?: boolean
  placeholder?: string
  loading?: boolean
  loadingPlaceholder?: string
  shouldFilter?: boolean
  customFilter?: (option: T) => boolean
  showCheckmark?: boolean
  side?: 'top' | 'bottom' | 'left' | 'right'
  align?: 'start' | 'center' | 'end'
  sideOffset?: number
  collisionPadding?: number
  value?: string
  onChange: (value: string) => void
  getSelectedLabel?: (value: string) => void
  portal?: boolean
  modal?: boolean
  width?: number | string
  dark?: boolean
}

export function SelectPopover<T extends SelectOption>({
  open,
  setOpen,
  children,
  options,
  value,
  onChange,
  query,
  onQueryChange,
  onOpenChange,
  placeholder,
  typeAhead,
  loading = false,
  loadingPlaceholder = 'Searching...',
  showCheckmark = true,
  shouldFilter = true,
  customFilter,
  side,
  align = 'start',
  sideOffset,
  collisionPadding = 8,
  portal = true,
  modal,
  width = 250,
  dark
}: Props<T>) {
  const triggerRef = useRef<HTMLButtonElement>(null)

  const handleOpenChange = (open: boolean) => {
    setOpen(open)
    onQueryChange?.(query || '')
    onOpenChange?.(open)
  }

  return (
    <Popover modal={modal} open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger ref={triggerRef} asChild>
        {children}
      </PopoverTrigger>
      <ConditionalWrap condition={portal} wrap={(children) => <PopoverPortal>{children}</PopoverPortal>}>
        <PopoverContent
          asChild
          side={side}
          align={align}
          sideOffset={sideOffset}
          collisionPadding={collisionPadding}
          className={cn({ dark })}
          style={{
            minWidth: 'var(--radix-popover-trigger-width)',
            width: `max(var(--radix-popover-trigger-width), ${typeof width === 'number' ? `${width}px` : width})`
          }}
          addDismissibleLayer
        >
          <SelectCommandContainer
            className={cn('flex max-h-[min(430px,var(--radix-popover-content-available-height))] flex-col')}
            shouldFilter={customFilter ? false : shouldFilter}
            defaultValue={options.find((option) => option.value === value)?.label}
          >
            {typeAhead && (
              <>
                <SelectCommandInput
                  value={query}
                  placeholder={placeholder || 'Search...'}
                  onValueChange={onQueryChange}
                />
                <SelectCommandSeparator alwaysRender />
              </>
            )}

            <SelectCommandList className='scroll-py-1'>
              <SelectCommandEmpty>No results...</SelectCommandEmpty>
              <SelectCommandGroup className='py-1'>
                {!loading &&
                  options.map((option) => {
                    const isSelected = option.value === value

                    if (customFilter && !customFilter(option)) return null

                    return (
                      <SelectCommandItem
                        className={cn('justify-between', { 'h-fit items-start py-1': !!option.sublabel })}
                        key={`${option.value}${option.label}`}
                        value={option.label}
                        title={option.label}
                        onSelect={() => onChange(option.value)}
                      >
                        {option.leftSlot && option.leftSlot}

                        {option.sublabel && (
                          <div className='flex w-full flex-1 flex-col'>
                            <span className='truncate'>{option.label}</span>
                            {option.sublabel && (
                              <UIText secondary size='text-xs'>
                                {option.sublabel}
                              </UIText>
                            )}
                          </div>
                        )}

                        {!option.sublabel && (
                          <>
                            <span className='flex flex-1 items-center gap-1.5'>
                              <UIText className='truncate'>{option.label}</UIText>
                              {option.badge && option.badge}
                            </span>
                            {option.shortcut && <KeyboardShortcut shortcut={option.shortcut} />}
                          </>
                        )}

                        {showCheckmark && (
                          <CheckIcon className={cn('shrink-0', isSelected ? 'opacity-100' : 'opacity-0')} />
                        )}
                      </SelectCommandItem>
                    )
                  })}

                {loading && (
                  <SelectCommandLoading>
                    <UIText secondary size='text-xs' className='py-1 pl-2.5'>
                      {loadingPlaceholder}
                    </UIText>
                  </SelectCommandLoading>
                )}
              </SelectCommandGroup>
            </SelectCommandList>
          </SelectCommandContainer>
        </PopoverContent>
      </ConditionalWrap>
    </Popover>
  )
}
