import React from 'react'
import { useFormContext } from 'react-hook-form'

import { RadioGroup } from '@campsite/ui/Radio'
import { cn } from '@campsite/ui/utils'

export function NotificationScheduleRadioGroup({
  className,
  children,
  ...rest
}: React.PropsWithChildren & Pick<React.ComponentPropsWithoutRef<typeof RadioGroup>, 'className'>) {
  const { watch, trigger, setValue } = useFormContext()

  return (
    <RadioGroup
      loop
      aria-label='Notification schedule type'
      className={cn('flex flex-col gap-3', className)}
      orientation='vertical'
      value={watch('type')}
      onValueChange={(newValue) => {
        setValue('type', newValue)
        trigger(['days', 'start_time'])
      }}
      {...rest}
    >
      {children}
    </RadioGroup>
  )
}
