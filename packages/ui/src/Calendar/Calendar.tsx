'use client'

import * as React from 'react'
import { ButtonHTMLAttributes, useMemo, useRef } from 'react'
import { add, format, sub } from 'date-fns'
import { DayPicker, useDayRender, useNavigation } from 'react-day-picker'

import { Button } from '../Button'
import { ChevronLeftIcon, ChevronRightIcon } from '../Icons'
import { UIText } from '../Text'
import { cn } from '../utils'

export type CalendarProps = React.ComponentProps<typeof DayPicker>

// eslint-disable-next-line react/prop-types
export function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={className}
      classNames={{
        months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
        month: 'space-y-2',
        table: 'w-full border-collapse space-y-1',
        head_row: 'flex',
        head_cell: 'text-muted-foreground rounded-md w-8 m-0.5 font-normal text-[0.8rem]',
        row: 'flex w-full',
        cell: cn(
          'focus:ring-0 relative p-0 m-0.5 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected].day-range-end)]:rounded-r-md',
          props.mode === 'range'
            ? '[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md'
            : '[&:has([aria-selected])]:rounded-md'
        ),
        ...classNames
      }}
      components={{
        Day: ({ date, ...props }) => {
          const buttonRef = useRef(null)
          const { buttonProps, activeModifiers } = useDayRender(date, props.displayMonth, buttonRef)
          const buttonVariant = useMemo(() => {
            if (activeModifiers.selected) return 'important'
            if (activeModifiers.today) return 'flat'
            if (activeModifiers.hidden) return 'none'
            return 'plain'
          }, [activeModifiers])

          return (
            <Button
              {...(buttonProps as ButtonHTMLAttributes<HTMLButtonElement>)}
              ref={buttonRef}
              className={cn(
                'm-0 h-8 w-8 p-0',
                activeModifiers.outside && 'opacity-60',
                activeModifiers.selected && 'focus:ring-0',
                buttonProps.className
              )}
              variant={buttonVariant}
            >
              {date.getDate()}
            </Button>
          )
        },
        Caption: ({ displayMonth }) => {
          const { previousMonth, nextMonth, goToMonth } = useNavigation()

          return (
            <div className='relative flex'>
              <div className='flex-none'>
                <Button
                  accessibilityLabel='Previous month'
                  onClick={() => goToMonth(sub(displayMonth, { months: 1 }))}
                  disabled={!previousMonth}
                  iconOnly={<ChevronLeftIcon />}
                />
              </div>
              <div className='grow place-self-center text-center'>
                <UIText size='text-sm' weight='font-medium'>
                  {format(displayMonth, 'MMMM yyyy')}
                </UIText>
              </div>
              <div className='flex-none'>
                <Button
                  accessibilityLabel='Next month'
                  onClick={() => goToMonth(add(displayMonth, { months: 1 }))}
                  disabled={!nextMonth}
                  iconOnly={<ChevronRightIcon />}
                />
              </div>
            </div>
          )
        }
      }}
      {...props}
    />
  )
}
