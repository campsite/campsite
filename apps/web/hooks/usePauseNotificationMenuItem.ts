import { createElement, Fragment } from 'react'
import { isToday, isTomorrow } from 'date-fns'
import toast from 'react-hot-toast'

import { MoonIcon } from '@campsite/ui/Icons'
import { buildMenuItems, MenuItem } from '@campsite/ui/Menu'
import { delay } from '@campsite/ui/utils'

import { useCreateNotificationPause } from '@/hooks/useCreateNotificationPause'
import { useDeleteNotificationPause } from '@/hooks/useDeleteNotificationPause'
import { useGetCurrentUser } from '@/hooks/useGetCurrentUser'
import { useGetNotificationSchedule } from '@/hooks/useGetNotificationSchedule'

const formattedNotificationPauseDay = (date: Date) => {
  if (isToday(date)) return null
  if (isTomorrow(date)) return 'tomorrow'

  return date.toLocaleDateString(navigator.language || 'en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

const formattedNotificationPauseTime = (date: Date) => {
  return date.toLocaleTimeString(navigator.language || 'en-US', { timeStyle: 'short' })
}

export const formattedNotificationPauseExpiration = (date: Date) => {
  const formattedDay = formattedNotificationPauseDay(date)
  const formattedTime = formattedNotificationPauseTime(date)

  return {
    formattedDay,
    formattedTime,
    formattedDayAndTime: formattedDay ? `${formattedDay} at ${formattedTime}` : formattedTime
  }
}

export function usePauseNotificationMenuItem({
  setNotificationPauseCalendarDialogOpen,
  setNotificationScheduleDialogOpen
}: {
  setNotificationPauseCalendarDialogOpen: (open: boolean) => void
  setNotificationScheduleDialogOpen: (open: boolean) => void
}) {
  const { data: currentUser } = useGetCurrentUser()
  const { data: notificationSchedule } = useGetNotificationSchedule()
  const { mutate: createNotificationPause } = useCreateNotificationPause()
  const { mutate: deleteNotificationPause } = useDeleteNotificationPause()
  const formattedExpiration =
    currentUser?.notification_pause_expires_at &&
    formattedNotificationPauseExpiration(new Date(currentUser.notification_pause_expires_at))

  const onSelectNotificationPauseExpiration = async (date: Date) => {
    await delay(0)
    createNotificationPause(
      { expires_at: date.toISOString() },
      {
        onSuccess: () => {
          toast(`Paused until ${formattedNotificationPauseExpiration(date).formattedDayAndTime}`, {
            duration: 5000
          })
        }
      }
    )
  }

  const notificationPauseExpirationItems = buildMenuItems([
    currentUser?.staff && {
      type: 'item',
      label: 'For 5 seconds',
      onSelect: () => {
        onSelectNotificationPauseExpiration(new Date(Date.now() + 5 * 1000))
      }
    },
    {
      type: 'item',
      label: 'For 30 minutes',
      onSelect: () => {
        onSelectNotificationPauseExpiration(new Date(Date.now() + 30 * 60 * 1000))
      }
    },
    {
      type: 'item',
      label: 'For 1 hour',
      onSelect: () => {
        onSelectNotificationPauseExpiration(new Date(Date.now() + 60 * 60 * 1000))
      }
    },
    {
      type: 'item',
      label: 'For 2 hours',
      onSelect: () => {
        onSelectNotificationPauseExpiration(new Date(Date.now() + 2 * 60 * 60 * 1000))
      }
    },
    {
      type: 'item',
      label: 'Until tomorrow',
      onSelect: () => {
        const date = new Date()

        // Tomorrow at 9am in local time zone
        date.setDate(date.getDate() + 1)
        date.setHours(9, 0, 0, 0)

        onSelectNotificationPauseExpiration(date)
      }
    },
    {
      type: 'item',
      label: 'Until next week',
      onSelect: () => {
        const date = new Date()

        // Next Monday at 9am in local time zone
        date.setDate(date.getDate() + (7 - date.getDay()) + 1)
        date.setHours(9, 0, 0, 0)

        onSelectNotificationPauseExpiration(date)
      }
    },
    {
      type: 'item',
      label: 'Custom...',
      onSelect: () => {
        setNotificationPauseCalendarDialogOpen(true)
      }
    }
  ])

  const resumeNotificationsItems = buildMenuItems([
    formattedExpiration && {
      type: 'text',
      label: createElement(
        Fragment,
        null,
        formattedExpiration.formattedDay ? `Paused until ${formattedExpiration.formattedDay} at ` : 'Paused until ',
        createElement('span', { className: 'whitespace-nowrap' }, formattedExpiration.formattedTime)
      )
    },
    {
      type: 'item',
      label: 'Resume notifications',
      onSelect: async () => {
        await delay(0)
        deleteNotificationPause(undefined, {
          onSuccess: () => {
            toast('Notifications resumed', { duration: 5000 })
          }
        })
      }
    },
    {
      type: 'sub',
      label: 'Adjust time',
      items: notificationPauseExpirationItems
    }
  ])

  const menuItem: MenuItem = {
    type: 'sub',
    label: 'Pause notifications',
    leftSlot: createElement(MoonIcon),
    items: buildMenuItems([
      ...(currentUser?.notifications_paused && currentUser.notification_pause_expires_at
        ? resumeNotificationsItems
        : notificationPauseExpirationItems),
      {
        type: 'separator'
      },
      {
        type: 'item',
        label: notificationSchedule?.type === 'custom' ? 'Update schedule...' : 'Set a notification schedule...',
        onSelect: () => {
          setNotificationScheduleDialogOpen(true)
        }
      },
      {
        type: 'separator'
      },
      {
        type: 'text',
        label: 'Do not disturb. Anything you miss will be in your inbox to review later.'
      }
    ])
  }

  return menuItem
}
