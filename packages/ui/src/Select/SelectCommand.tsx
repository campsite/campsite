'use client'

import * as React from 'react'

import { SearchIcon } from '../'
import { Command as CommandPrimitive, HighlightedCommandItem } from '../Command'
import { cn } from '../utils'

export const SelectCommandContainer = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className, ...props }, ref) => (
  <CommandPrimitive
    ref={ref}
    className={cn(
      'bg-elevated dark:border-primary-opaque rounded-[9px] border border-neutral-400/40 shadow-md dark:shadow-[0px_0px_0px_0.5px_rgba(0,0,0,1),_0px_4px_4px_rgba(0,0,0,0.24)]',
      className
    )}
    {...props}
  />
))

SelectCommandContainer.displayName = 'SelectCommandContainer'

export const SelectCommandInput = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ ...props }, ref) => (
  <div className='flex items-center px-2.5 pt-1'>
    <span className='shrink-0 opacity-60'>
      <SearchIcon />
    </span>
    <CommandPrimitive.Input
      ref={ref}
      className='h-8 w-full border-0 bg-transparent px-2 py-3 text-[15px] text-sm placeholder-gray-400 outline-none focus:border-black/5 focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50'
      {...props}
    />
  </div>
))

SelectCommandInput.displayName = 'SelectCommandInput'

export const SelectCommandList = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    className={cn('scrollbar-hide m-0 flex-1 space-y-1 overflow-y-auto overflow-x-hidden px-1', className)}
    {...props}
  />
))

SelectCommandList.displayName = 'SelectCommandList'

export const SelectCommandEmpty = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>((props, ref) => (
  <CommandPrimitive.Empty
    ref={ref}
    className='text-tertiary inline-flex h-full w-full select-none items-center justify-center p-4 text-center text-[15px] text-sm'
    {...props}
  />
))

SelectCommandEmpty.displayName = 'SelectCommandEmpty'

export const SelectCommandGroup = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Group ref={ref} className={cn('m-0 overflow-hidden !outline-none', className)} {...props} />
))

SelectCommandGroup.displayName = 'SelectCommandGroup'

export const SelectCommandLoading = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Loading>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Loading>
>((props, ref) => <CommandPrimitive.Loading ref={ref} {...props} />)

SelectCommandLoading.displayName = 'SelectCommandLoading'

export const SelectCommandSeparator = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Separator
    ref={ref}
    className={cn(
      'bg-tertiary relative mx-0 my-0 h-px shrink-0 shadow-[0px_1px_0px_rgb(255_255_255_/_0.05)] dark:bg-gray-900',
      className
    )}
    {...props}
  />
))

SelectCommandSeparator.displayName = 'SelectCommandSeparator'

export const SelectCommandItem = React.forwardRef<
  React.ElementRef<typeof HighlightedCommandItem>,
  React.ComponentPropsWithoutRef<typeof HighlightedCommandItem>
>(({ className, ...props }, ref) => (
  <HighlightedCommandItem ref={ref} className={cn('relative h-8 gap-1.5 text-sm font-medium', className)} {...props} />
))

SelectCommandItem.displayName = 'SelectCommandItem'
