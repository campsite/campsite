import { useState } from 'react'
import { addHours } from 'date-fns'
import toast from 'react-hot-toast'

import { Button, Dialog } from '@campsite/ui/index'

import { DateAndTimePicker } from '@/components/DateAndTimePicker'
import { useCreateNotificationPause } from '@/hooks/useCreateNotificationPause'
import { formattedNotificationPauseExpiration } from '@/hooks/usePauseNotificationMenuItem'

export function NotificationPauseCalendarDialog({
  open,
  onOpenChange
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { mutate: createNotificationPause } = useCreateNotificationPause()

  const onSelectNotificationPauseExpiration = (date: Date) => {
    createNotificationPause(
      { expires_at: date.toISOString() },
      {
        onSuccess: () => {
          toast(`Paused until ${formattedNotificationPauseExpiration(date).formattedDayAndTime}`, {
            duration: 5000
          })
          onOpenChange(false)
        }
      }
    )
  }

  const [date, setDate] = useState<Date>(addHours(new Date(), 1))

  return (
    <Dialog.Root
      size='fit'
      open={open}
      onOpenChange={onOpenChange}
      visuallyHiddenTitle='Custom notification pause date'
      visuallyHiddenDescription='Select a date to pause notifications until'
    >
      <Dialog.Content className='place-self-center p-6'>
        <div className='flex h-full w-full flex-col gap-3'>
          <DateAndTimePicker value={date} onChange={setDate} />
          <Button
            fullWidth
            disabled={date < new Date()}
            className='py-1'
            variant='primary'
            onClick={() => {
              onSelectNotificationPauseExpiration(date)
            }}
          >
            {date < new Date() ? 'Select future time' : 'Pause notifications'}
          </Button>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  )
}
