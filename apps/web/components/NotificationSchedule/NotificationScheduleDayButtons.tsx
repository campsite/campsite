import { useFormContext } from 'react-hook-form'

import { UsersMeNotificationSchedulePutRequest } from '@campsite/types/generated'
import { Button } from '@campsite/ui/Button'
import { UIText } from '@campsite/ui/Text'

import { NotificationScheduleFormSchema } from '@/hooks/useNotificationScheduleForm'

export function NotificationScheduleDayButtons() {
  const {
    setValue,
    watch,
    formState: { errors }
  } = useFormContext<NotificationScheduleFormSchema>()
  const days = watch('days')

  function toggleDay(day: UsersMeNotificationSchedulePutRequest['days'][number]) {
    setValue('days', days.includes(day) ? days.filter((d) => d !== day) : [...days, day], { shouldValidate: true })
  }

  return (
    <div className='flex flex-col gap-2'>
      <div className='flex gap-2'>
        <DayButton onClick={() => toggleDay('Monday')} isActive={days.includes('Monday')}>
          M
        </DayButton>
        <DayButton onClick={() => toggleDay('Tuesday')} isActive={days.includes('Tuesday')}>
          T
        </DayButton>
        <DayButton onClick={() => toggleDay('Wednesday')} isActive={days.includes('Wednesday')}>
          W
        </DayButton>
        <DayButton onClick={() => toggleDay('Thursday')} isActive={days.includes('Thursday')}>
          T
        </DayButton>
        <DayButton onClick={() => toggleDay('Friday')} isActive={days.includes('Friday')}>
          F
        </DayButton>
        <DayButton onClick={() => toggleDay('Saturday')} isActive={days.includes('Saturday')}>
          S
        </DayButton>
        <DayButton onClick={() => toggleDay('Sunday')} isActive={days.includes('Sunday')}>
          S
        </DayButton>
      </div>
      {errors.days && <UIText className='text-xs text-red-500'>{errors.days.message}</UIText>}
    </div>
  )
}

function DayButton({
  children,
  onClick,
  isActive
}: {
  children: React.ReactNode
  onClick: () => void
  isActive: boolean
}) {
  return (
    <Button onClick={onClick} variant={isActive ? 'important' : 'base'} className='h-8 w-8 text-xs' round>
      {children}
    </Button>
  )
}
