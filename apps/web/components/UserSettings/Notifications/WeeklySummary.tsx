import { useCreateScheduledNotification } from 'hooks/useCreateScheduledNotification'
import { useDeleteScheduledNotification } from 'hooks/useDeleteScheduledNotification'
import { useGetCurrentUserNotifications } from 'hooks/useGetCurrentUserNotifications'
import toast from 'react-hot-toast'

import { Checkbox, UIText } from '@campsite/ui'

import { DayPicker } from '@/components/ScheduledNotification/DayPicker'
import { TimePicker } from '@/components/ScheduledNotification/TimePicker'
import { useUpdateScheduledNotification } from '@/hooks/useUpdateScheduledNotification'
import { NotificationName } from '@/utils/types'

interface Props {
  tz: string
}

export function WeeklySummarySettings(props: Props) {
  const { data: notifications } = useGetCurrentUserNotifications()

  const weeklyDigest = notifications?.find((n) => n.name == NotificationName.WeeklyDigest)
  const deliveryDay = weeklyDigest?.delivery_day || 'friday'
  const deliveryTime = weeklyDigest?.delivery_time || '5:00 pm'
  const hasWeeklyDigest = !!weeklyDigest

  const createNotification = useCreateScheduledNotification()
  const deleteNotification = useDeleteScheduledNotification()
  const updateNotification = useUpdateScheduledNotification()

  function handleCreateNotification() {
    createNotification.mutate({
      name: NotificationName.WeeklyDigest,
      delivery_day: deliveryDay,
      delivery_time: deliveryTime,
      time_zone: props.tz
    })
  }

  function handleDeleteNotification(id: string) {
    deleteNotification.mutate(id)
  }

  function handleEnableDisable(checked: boolean) {
    if (checked) return handleCreateNotification()
    return handleDeleteNotification(weeklyDigest?.id as string)
  }

  function handleTimeChange(value: string) {
    updateNotification.mutate(
      {
        id: weeklyDigest?.id as string,
        name: NotificationName.WeeklyDigest,
        delivery_day: deliveryDay,
        delivery_time: value,
        time_zone: props.tz
      },
      {
        onSuccess: () => {
          toast('Weekly digest time updated')
        }
      }
    )
  }

  function handleDayChange(value: string) {
    updateNotification.mutate(
      {
        id: weeklyDigest?.id as string,
        name: NotificationName.WeeklyDigest,
        delivery_day: value,
        delivery_time: deliveryTime,
        time_zone: props.tz
      },
      {
        onSuccess: () => {
          toast('Weekly digest day updated')
        }
      }
    )
  }

  return (
    <form className='flex flex-col p-3 pt-0'>
      <div className='flex flex-col gap-1'>
        <label className='flex items-center space-x-3 self-start'>
          <Checkbox
            checked={hasWeeklyDigest}
            onChange={handleEnableDisable}
            disabled={
              createNotification.isPending || deleteNotification.isPending || (weeklyDigest && !weeklyDigest.id)
            }
          />
          <UIText weight='font-medium'>Weekly summary</UIText>
        </label>
      </div>

      <div className='ml-8'>
        <UIText tertiary>Get a weekly email with all posts shared in your organization.</UIText>
      </div>

      {weeklyDigest && weeklyDigest.delivery_day && (
        <div className='ml-8 grid grid-cols-1 items-start gap-3 pt-3 md:w-3/4 md:grid-cols-4 md:gap-2'>
          <DayPicker value={weeklyDigest.delivery_day} onChange={handleDayChange} />
          <TimePicker value={deliveryTime} onChange={handleTimeChange} />
        </div>
      )}
    </form>
  )
}
