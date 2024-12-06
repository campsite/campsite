import { useId } from 'react'
import * as RadixSwitch from '@radix-ui/react-switch'
import { m } from 'framer-motion'

import { UIText } from '../Text'
import { cn } from '../utils'

interface Props {
  checked: boolean
  disabled?: boolean
  isLoading?: boolean
  label?: string
  labelSide?: 'left' | 'right'
  required?: boolean
  value?: string
  onChange: (isChecked: boolean) => void
  size?: 'base' | 'lg'
  id?: string
}

export const Switch: React.FC<Props> = ({
  checked,
  disabled,
  isLoading,
  label,
  labelSide = 'left',
  onChange,
  required,
  value,
  size = 'base',
  id: _id
}) => {
  const fallbackId = useId()
  const id = _id || fallbackId

  return (
    <div
      className={cn('inline-flex items-center', {
        'gap-3': label
      })}
    >
      {label && labelSide === 'left' && <Label label={label} htmlFor={id} />}

      <RadixSwitch.Root
        checked={checked}
        id={id}
        disabled={disabled || isLoading}
        required={required}
        value={value}
        onCheckedChange={onChange}
        className={cn(
          'relative flex rounded-full p-0.5 transition focus-visible:ring-0',
          'before:pointer-events-none before:absolute before:-inset-[3px] before:rounded-full before:border before:border-blue-500 before:opacity-0 before:ring-2 before:ring-blue-500/20 before:transition-opacity focus:before:opacity-100',
          {
            'bg-gray-400': !checked,
            'bg-blue-500': checked,
            'opacity-50': disabled
          },
          {
            'h-4 w-7': size === 'base',
            'h-5 w-9': size === 'lg'
          }
        )}
      >
        <RadixSwitch.Thumb asChild>
          <m.span
            initial={false}
            className={cn(
              'block aspect-square h-full rounded-full bg-gradient-to-b from-white via-white transition-all',
              {
                'translate-x-0 to-gray-100': !checked,
                'translate-x-full to-gray-200': checked
              }
            )}
          />
        </RadixSwitch.Thumb>
      </RadixSwitch.Root>

      {label && labelSide === 'right' && <Label label={label} htmlFor={id} />}
    </div>
  )
}

interface LabelProps {
  htmlFor: string
  label: string
  onClick?: () => void
}

// TODO: Add aria-describedby, aria-labelledby, aria-label capabilities https://cccaccessibility.org/web-1/web-developer-tutorials/aria-labelledby-vs-aria-describedby-vs-aria-label

export const Label = ({ htmlFor, label, onClick }: LabelProps) => {
  return (
    <UIText
      element='label'
      className='block cursor-default select-none text-sm font-medium leading-none tracking-tight'
      htmlFor={htmlFor}
      onClick={onClick}
    >
      {label}
    </UIText>
  )
}
