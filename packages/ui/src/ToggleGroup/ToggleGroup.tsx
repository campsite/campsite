import * as RadixToggleGroup from '@radix-ui/react-toggle-group'
import { m } from 'framer-motion'

import { cn } from '../utils'

interface Props {
  ariaLabel: string
  items: { value: string; label: string; icon?: React.ReactNode }[]
  value: string
  onValueChange: (value: string) => void
}

export const ToggleGroup = ({ ariaLabel, items, onValueChange, value }: Props) => {
  return (
    <RadixToggleGroup.Root
      className='p-sm inline-flex h-8 flex-1 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700'
      type='single'
      value={value}
      aria-label={ariaLabel}
      onValueChange={onValueChange}
    >
      {items.map((item) => (
        <RadixToggleGroup.Item
          key={item.value}
          value={item.value}
          aria-label={item.label}
          className={cn(
            'initial:text-tertiary initial:dark:text-secondary relative flex-1 px-3.5 text-[13px] font-medium focus-visible:outline-none focus-visible:ring-0',
            'after:pointer-events-none after:absolute after:-inset-[3px] after:rounded-lg after:border after:border-blue-500 after:opacity-0 after:ring-2 after:ring-blue-500/20 after:transition-opacity focus-visible:after:opacity-100 active:after:opacity-0',
            {
              'text-primary': item.value === value
            }
          )}
        >
          <span className='relative z-[1]'>{item.icon || item.label}</span>
          {item.value === value && (
            <m.span
              initial={false}
              className='absolute inset-px rounded-md border bg-white shadow dark:border-none dark:bg-gray-950 dark:shadow-[inset_0px_1px_0px_rgb(255_255_255_/_0.08)] dark:ring-1 dark:ring-gray-950'
              transition={{ duration: 0.15 }}
            />
          )}
        </RadixToggleGroup.Item>
      ))}
    </RadixToggleGroup.Root>
  )
}
