import { useMutation, useQueryClient } from '@tanstack/react-query'

import { ScheduledNotification } from '@campsite/types'

import { apiErrorToast } from '@/utils/apiErrorToast'
import { apiClient, setTypedQueriesData } from '@/utils/queryClient'

const getMeScheduledNotifications = apiClient.users.getMeScheduledNotifications().requestKey()

export function useUpdateScheduledNotification() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ScheduledNotification) =>
      apiClient.users.putMeScheduledNotificationsById().request(data.id, data),
    onMutate: (data) => {
      setTypedQueriesData(queryClient, getMeScheduledNotifications, (old) => {
        if (!old) return

        return old.map((notification) => {
          if (notification.id === data.id) {
            return data
          }

          return notification
        })
      })
    },
    onError: apiErrorToast
  })
}
