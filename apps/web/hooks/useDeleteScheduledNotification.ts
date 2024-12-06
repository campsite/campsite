import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { apiErrorToast } from '@/utils/apiErrorToast'
import { apiClient, setTypedQueriesData } from '@/utils/queryClient'

const getMeScheduledNotifications = apiClient.users.getMeScheduledNotifications().requestKey()

export function useDeleteScheduledNotification() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => apiClient.users.deleteMeScheduledNotificationsById().request(id),
    onMutate: (id) => {
      setTypedQueriesData(queryClient, getMeScheduledNotifications, (old) => {
        if (!old) return

        return old.filter((notification) => notification.id !== id)
      })

      toast('Notification updated')
    },
    onError: apiErrorToast
  })
}
