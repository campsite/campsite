import { useCreateScheduledNotification } from 'hooks/useCreateScheduledNotification'
import { useDeleteScheduledNotification } from 'hooks/useDeleteScheduledNotification'
import { useGetCurrentUserNotifications } from 'hooks/useGetCurrentUserNotifications'
import toast from 'react-hot-toast'

import { Checkbox, UIText } from '@campsite/ui'

import { TimePicker } from '@/components/ScheduledNotification/TimePicker'
import { useUpdateScheduledNotification } from '@/hooks/useUpdateScheduledNotification'
import { NotificationName } from '@/utils/types'

interface Props {
  tz: string
}

export function DailySummarySettings(props: Props) {
  const { data: notifications } = useGetCurrentUserNotifications()
  const dailyDigest = notifications?.find((n) => n.name == NotificationName.DailyDigest)
  const deliveryTime = dailyDigest?.delivery_time || '9:00 am'
  const hasDailyDigest = !!dailyDigest

  const createNotification = useCreateScheduledNotification()
  const deleteNotification = useDeleteScheduledNotification()
  const updateNotification = useUpdateScheduledNotification()

  function handleCreateNotification() {
    createNotification.mutate({
      delivery_day: null,
      name: NotificationName.DailyDigest,
      delivery_time: deliveryTime,
      time_zone: props.tz
    })
  }

  function handleDeleteNotification(id: string) {
    deleteNotification.mutate(id)
  }

  function handleEnableDisable(checked: boolean) {
    if (checked) return handleCreateNotification()
    return handleDeleteNotification(dailyDigest?.id as string)
  }

  function handleTimeChange(value: string) {
    updateNotification.mutate(
      {
        id: dailyDigest?.id as string,
        delivery_time: value,
        time_zone: props.tz,
        delivery_day: null,
        name: NotificationName.DailyDigest
      },
      {
        onSuccess: () => {
          toast('Daily digest time updated')
        }
      }
    )
  }

  return (
    <form className='flex flex-col p-3 pt-3'>
      <div className='flex flex-col gap-1'>
        <label className='flex items-center space-x-3 self-start'>
          <Checkbox
            checked={hasDailyDigest}
            onChange={handleEnableDisable}
            disabled={
              deleteNotification.isPending ||
              createNotification.isPending ||
              updateNotification.isPending ||
              (dailyDigest && !dailyDigest.id)
            }
          />
          <UIText weight='font-medium'>Daily summary</UIText>
        </label>
      </div>

      <div className='ml-8'>
        <UIText tertiary>Get a daily email with posts you might have missed.</UIText>
      </div>

      {dailyDigest && (
        <div className='ml-8 grid grid-cols-1 items-start gap-3 pt-3 md:w-3/4 md:grid-cols-4 md:gap-2'>
          <TimePicker value={deliveryTime} onChange={handleTimeChange} />
        </div>
      )}
    </form>
  )
}
