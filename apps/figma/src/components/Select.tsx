import { ReactNode, useEffect, useRef, useState } from 'react'
import * as RadixSelect from '@radix-ui/react-select'
import { AnimatePresence, m, useIsomorphicLayoutEffect } from 'framer-motion'

import {
  Button,
  ChevronSelectIcon,
  cn,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  ConditionalWrap,
  LoadingSpinner,
  POPOVER_MOTION,
  SearchIcon,
  UIText
} from '@campsite/ui'

/**
 * This component was previously part of @campsite/ui, but we're deprecating it in favor of a new component.
 * The Figma plugin is the only part of the codebase that still uses this component, so we moved it here.
 */

export interface BaseSelectProps<T> {
  trigger?(children: ReactNode): ReactNode
  fullWidth?: boolean
  align: 'start' | 'end' | 'center'
  side?: 'top' | 'bottom'
  container?: HTMLElement | null
  disabled?: boolean
  value: T
  onValueChange(value: T): void
  options: (NonNullable<T> | '---' | { heading: string; items: NonNullable<T>[] })[]
  getItemKey(item: NonNullable<T>): string
  getItemTextValue?(item: NonNullable<T>): string
  renderItem(item: NonNullable<T>, location: 'value' | 'option'): ReactNode
}

export interface BasicSelectProps<T> extends BaseSelectProps<T> {
  variant?: 'basic'
}

export interface ComboboxSelectProps<T> extends BaseSelectProps<T> {
  variant: 'combobox'
  isEmpty?: boolean
  isLoading?: boolean
  query: string
  onQueryChange(query: string): void
}

export type SelectProps<T> = BasicSelectProps<T> | ComboboxSelectProps<T>

type BasicViewportProps<T> = Pick<BasicSelectProps<T>, 'options' | 'getItemKey' | 'getItemTextValue' | 'renderItem'>

function BasicViewport<T>({ options, getItemKey, getItemTextValue, renderItem }: BasicViewportProps<T>) {
  return (
    <RadixSelect.Viewport>
      {options.map((option, index) => {
        if (option === '---') {
          // eslint-disable-next-line react/no-array-index-key
          return <RadixSelect.Separator key={index} />
        } else if (typeof option === 'object' && 'heading' in option) {
          return (
            <RadixSelect.Group key={option.heading}>
              <RadixSelect.Label>
                <span className='mx-1 flex px-2.5 py-1'>
                  <UIText element='span' size='text-xs' secondary>
                    {option.heading}
                  </UIText>
                </span>
              </RadixSelect.Label>
              {option.items.map((option) => (
                <RadixSelect.Item
                  key={getItemKey(option)}
                  className={cn(
                    'h-8.5 group relative mx-1 flex cursor-pointer items-center rounded-[5px] border-none px-3 text-sm font-medium outline-none',
                    'focus:shadow-dropdown-item focus:bg-white/20'
                  )}
                  value={getItemKey(option)}
                  textValue={getItemTextValue?.(option)}
                >
                  <RadixSelect.ItemText>
                    <span className='relative z-[1] flex-1 transform-gpu'>{renderItem(option, 'option')}</span>
                  </RadixSelect.ItemText>
                </RadixSelect.Item>
              ))}
            </RadixSelect.Group>
          )
        } else {
          return (
            <RadixSelect.Item
              key={getItemKey(option)}
              className={cn(
                'h-8.5 group relative mx-1 flex cursor-pointer items-center rounded-[5px] border-none px-3 text-sm font-medium outline-none',
                'focus:shadow-dropdown-item focus:bg-white/20'
              )}
              value={getItemKey(option)}
              textValue={getItemTextValue?.(option)}
            >
              <RadixSelect.ItemText>
                <span className='relative z-[1] flex-1 transform-gpu'>{renderItem(option, 'option')}</span>
              </RadixSelect.ItemText>
            </RadixSelect.Item>
          )
        }
      })}
    </RadixSelect.Viewport>
  )
}

type ComboboxViewportProps<T> = Pick<
  ComboboxSelectProps<T>,
  'isLoading' | 'isEmpty' | 'onValueChange' | 'query' | 'onQueryChange' | 'options' | 'getItemKey' | 'renderItem'
>

function ComboboxViewport<T>({
  isEmpty,
  isLoading,
  query,
  onQueryChange,
  onValueChange,
  options,
  getItemKey,
  renderItem
}: ComboboxViewportProps<T>) {
  const ref = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState(0)

  useIsomorphicLayoutEffect(() => {
    if (ref.current) {
      const observer = new ResizeObserver((entries) => {
        setHeight(entries[0].contentRect.height)
      })

      observer.observe(ref.current)
      return () => observer.disconnect()
    }
  }, [])

  return (
    <Command
      className='bg-elevated shadow-popover flex flex-col rounded-lg border border-transparent transition-all duration-75 dark:border-gray-800'
      shouldFilter={false}
    >
      <div
        className={cn(
          'z-10 flex items-center px-3.5 py-1 [[data-side=top]_&]:order-2',
          '[[data-side=bottom]_&]:border-b [[data-side=top]_&]:border-t'
        )}
        cmdk-input-wrapper=''
      >
        <span className='shrink-0 opacity-60'>
          <SearchIcon />
        </span>
        <CommandInput
          className={cn(
            'border-0 bg-transparent py-0', // reset Figma styles
            'h-8 w-full !px-2 !text-sm focus:!outline-none focus:!ring-0 disabled:cursor-not-allowed disabled:opacity-50'
          )}
          placeholder='Search...'
          value={query}
          onValueChange={onQueryChange}
        />

        {isLoading && (
          <span className='flex shrink-0'>
            <LoadingSpinner />
          </span>
        )}
      </div>

      <CommandList
        className={cn(
          'scrollbar-hide overflow-y-auto overflow-x-hidden',
          '[[data-side=bottom]_&]:scroll-pt-1 [[data-side=top]_&]:scroll-pb-1'
        )}
        style={{
          maxHeight: `min(${height}px, var(--radix-select-content-available-height) - 3em)`
        }}
      >
        <div ref={ref}>
          <div className='[[data-side=bottom]_&]:h-1' />
          {options.map((option, index) => {
            if (option === '---') {
              // eslint-disable-next-line react/no-array-index-key
              return <CommandSeparator key={index} alwaysRender className='my-1 border-t' />
            } else if (typeof option === 'object' && 'heading' in option) {
              return (
                <CommandGroup
                  key={option.heading}
                  heading={
                    <span className='mx-1 flex px-2.5 py-1'>
                      <UIText element='span' size='text-xs' secondary>
                        {option.heading}
                      </UIText>
                    </span>
                  }
                >
                  {option.items.map((option) => (
                    <CommandItem
                      className={cn(
                        'group relative mx-1 flex cursor-pointer items-center rounded-[5px] border-none px-2.5 py-2 text-sm font-medium outline-none',
                        'data-[selected=true]:shadow-dropdown-item data-[selected=true]:bg-white/20'
                      )}
                      key={getItemKey(option)}
                      value={getItemKey(option)}
                      onSelect={() => onValueChange(option)}
                    >
                      <span className='relative z-[1] flex flex-1 transform-gpu overflow-hidden'>
                        {renderItem(option, 'option')}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )
            } else {
              return (
                <CommandItem
                  className={cn(
                    'group relative mx-1 flex cursor-pointer items-center rounded-[5px] border-none px-2.5 py-2 text-sm font-medium outline-none',
                    'data-[selected=true]:shadow-dropdown-item data-[selected=true]:bg-white/20'
                  )}
                  key={getItemKey(option)}
                  value={getItemKey(option)}
                  onSelect={() => onValueChange(option)}
                >
                  <span className='relative z-[1] flex flex-1 transform-gpu overflow-hidden'>
                    {renderItem(option, 'option')}
                  </span>
                </CommandItem>
              )
            }
          })}

          <ConditionalWrap
            condition={isEmpty === undefined}
            wrap={(children) => <CommandEmpty>{children}</CommandEmpty>}
          >
            <div className={cn('py-4 text-center', { hidden: isEmpty === false })}>
              <UIText secondary size='text-xs'>
                Nothing here...
              </UIText>
            </div>
          </ConditionalWrap>

          <div className='[[data-side=top]_&]:h-1' />
        </div>
      </CommandList>
    </Command>
  )
}

export function Select<T>({
  trigger,
  fullWidth,
  options,
  align,
  side,
  container,
  disabled,
  value,
  onValueChange,
  getItemKey,
  getItemTextValue,
  renderItem,
  ...props
}: SelectProps<T>) {
  const [open, setOpen] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  function defaultTrigger(children: ReactNode) {
    return (
      <Button variant='plain' className='px-1.5'>
        {children}
      </Button>
    )
  }

  // Keep the selected item in view when options change or list opens
  useEffect(() => {
    if (open && props.variant === 'combobox') {
      requestAnimationFrame(() => {
        const list = contentRef.current?.querySelector<HTMLInputElement>('[cmdk-list]')

        list?.querySelector('[data-selected="true"]')?.scrollIntoView({ behavior: 'auto' })
      })
    }
  }, [options, open, props.variant])

  return (
    <RadixSelect.Root
      open={open}
      onOpenChange={(open) => {
        setOpen(open)
        // Focus the input when the list opens
        if (open && props.variant === 'combobox') {
          requestAnimationFrame(() => {
            contentRef.current?.querySelector<HTMLInputElement>('input')?.focus()
          })
        }
      }}
      disabled={disabled || (props.variant === 'basic' && !options.length)}
      value={value ? getItemKey(value) : undefined}
      onValueChange={(key: string) => {
        const allOptions = options.flatMap((option) => {
          if (option === '---') {
            return []
          } else if (typeof option === 'object' && 'heading' in option) {
            return option.items
          } else {
            return option
          }
        })

        const option = allOptions.find((option) => getItemKey(option) === key)

        if (option) {
          onValueChange(option)
        }
      }}
    >
      <RadixSelect.Trigger asChild>
        {(trigger ?? defaultTrigger)(
          <span className='flex flex-1 items-center justify-between gap-2 overflow-hidden'>
            <span className='flex-1 overflow-hidden'>
              <RadixSelect.Value asChild>{value && renderItem(value, 'value')}</RadixSelect.Value>
            </span>

            {(props.variant === 'combobox' || options.length > 0) && (
              <span className='text-tertiary shrink-0'>
                <ChevronSelectIcon />
              </span>
            )}
          </span>
        )}
      </RadixSelect.Trigger>

      <AnimatePresence>
        <RadixSelect.Portal container={container}>
          <RadixSelect.Content asChild position='popper' align={align} side={side} sideOffset={8}>
            <m.div
              ref={contentRef}
              {...POPOVER_MOTION}
              className={cn(
                'text-gray-150 shadow-popover bg-primary dark:bg-elevated dark select-none rounded-lg border-black/50 bg-black py-1 dark:border',
                'max-h-[--radix-select-content-available-height]',
                'z-[9999] origin-[--radix-popper-transform-origin]',
                {
                  'w-[220px]': !fullWidth,
                  'w-[--radix-popper-anchor-width]': fullWidth
                }
              )}
            >
              {(!props.variant || props.variant === 'basic') && (
                <BasicViewport
                  options={options}
                  getItemKey={getItemKey}
                  getItemTextValue={getItemTextValue}
                  renderItem={renderItem}
                />
              )}
              {props.variant === 'combobox' && (
                <ComboboxViewport
                  isLoading={props.isLoading}
                  isEmpty={props.isEmpty}
                  query={props.query}
                  onQueryChange={props.onQueryChange}
                  onValueChange={(option) => {
                    onValueChange(option)
                    setOpen(false)
                  }}
                  options={options}
                  getItemKey={getItemKey}
                  renderItem={renderItem}
                />
              )}
            </m.div>
          </RadixSelect.Content>
        </RadixSelect.Portal>
      </AnimatePresence>
    </RadixSelect.Root>
  )
}
