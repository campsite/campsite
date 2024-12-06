import { useCallback } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { SubmitHandler, useForm } from 'react-hook-form'
import { z } from 'zod'

import { NotificationSchedule, UsersMeNotificationSchedulePutRequest } from '@campsite/types/generated'

import { useDeleteNotificationSchedule } from '@/hooks/useDeleteNotificationSchedule'
import { useUpdateNotificationSchedule } from '@/hooks/useUpdateNotificationSchedule'

export type NotificationScheduleFormSchema = UsersMeNotificationSchedulePutRequest & {
  type: 'none' | 'custom'
}

const notificationScheduleSchema = z
  .object({
    type: z.enum(['none', 'custom']),
    days: z.array(z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])).optional(),
    start_time: z.string().optional(),
    end_time: z.string().optional()
  })
  .refine((data) => data.type === 'none' || (data.days && data.days?.length > 0), {
    message: 'Select at least one day',
    path: ['days']
  })
  .refine((data) => data.type === 'none' || (data.start_time && data.end_time && data?.start_time < data?.end_time), {
    message: 'Start time must be before end time',
    path: ['start_time']
  })

export function useNotificationScheduleForm({ notificationSchedule }: { notificationSchedule: NotificationSchedule }) {
  return useForm<NotificationScheduleFormSchema>({
    resolver: zodResolver(notificationScheduleSchema),
    mode: 'all',
    defaultValues: {
      type: notificationSchedule.type,
      days: notificationSchedule.custom?.days || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      start_time: notificationSchedule.custom?.start_time || '08:00',
      end_time: notificationSchedule.custom?.end_time || '18:00'
    }
  })
}

interface OnSubmitOptions {
  onSuccess?: () => void
}

export function useOnSubmitNotificationScheduleForm({ onSuccess }: OnSubmitOptions = {}) {
  const updateNotificationSchedule = useUpdateNotificationSchedule()
  const deleteNotificationSchedule = useDeleteNotificationSchedule()

  return {
    onSubmit: useCallback<SubmitHandler<NotificationScheduleFormSchema>>(
      (data) => {
        if (data.type === 'none') {
          deleteNotificationSchedule.mutate(undefined, { onSuccess })
          return
        }

        updateNotificationSchedule.mutate(
          {
            days: data.days,
            start_time: data.start_time,
            end_time: data.end_time
          },
          {
            onSuccess: () => {
              onSuccess?.()
            }
          }
        )
      },
      [deleteNotificationSchedule, onSuccess, updateNotificationSchedule]
    ),
    isPending: updateNotificationSchedule.isPending || deleteNotificationSchedule.isPending
  }
}
