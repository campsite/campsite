import { useMemo } from 'react'
import { useFormContext } from 'react-hook-form'

import { Select } from '@campsite/ui/Select'
import { UIText } from '@campsite/ui/Text'

import { NotificationScheduleFormSchema } from '@/hooks/useNotificationScheduleForm'

function useTimeOptions() {
  return useMemo(() => {
    const locale = navigator.language || 'en-US' // Get user's browser locale
    const options = []

    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeValue = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
        const date = new Date()

        date.setHours(hour, minute)

        options.push({
          label: date.toLocaleTimeString(locale, { hour: 'numeric', minute: 'numeric' }),
          value: timeValue
        })
      }
    }

    return options
  }, [])
}

export function NotificationScheduleTimeSelects() {
  const {
    setValue,
    trigger,
    watch,
    formState: { errors }
  } = useFormContext<NotificationScheduleFormSchema>()
  const timeOptions = useTimeOptions()

  return (
    <div className='flex max-w-[270px] flex-col gap-2'>
      <div className='flex items-center gap-2'>
        <div className='w-full'>
          <Select
            options={timeOptions}
            value={watch('start_time')}
            onChange={(newTime) => setValue('start_time', newTime, { shouldValidate: true })}
            popoverWidth='var(--radix-popover-trigger-width)'
          />
        </div>
        <UIText secondary>to</UIText>
        <div className='w-full'>
          <Select
            options={timeOptions}
            value={watch('end_time')}
            onChange={(newTime) => {
              setValue('end_time', newTime, { shouldValidate: true })
              trigger('start_time')
            }}
            popoverWidth='var(--radix-popover-trigger-width)'
          />
        </div>
      </div>
      {errors.start_time && <UIText className='text-xs text-red-500'>{errors.start_time.message}</UIText>}
    </div>
  )
}
