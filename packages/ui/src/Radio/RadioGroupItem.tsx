import * as RadioGroup from '@radix-ui/react-radio-group'

import { cn } from '../utils'

export type RadioGroupItemProps = RadioGroup.RadioGroupItemProps

export function RadioGroupItem(props: RadioGroupItemProps) {
  const { disabled, id, value, children } = props

  return (
    <label className='group flex items-start justify-start'>
      <RadioGroup.Item
        value={value}
        id={id}
        disabled={disabled}
        className={cn(
          'bg-elevated mr-2.5 flex h-5 w-5 max-w-xs flex-none cursor-default items-center justify-center rounded-full border focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-100 focus-visible:ring-offset-0 dark:focus-visible:border-blue-400 dark:focus-visible:ring-blue-600/20'
        )}
      >
        <RadioGroup.Indicator className='block h-2.5 w-2.5 rounded-full bg-blue-600' />
      </RadioGroup.Item>
      <span className='block flex-1 text-sm'>{children}</span>
    </label>
  )
}
