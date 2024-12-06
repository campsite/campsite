import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { v4 as uuid } from 'uuid'

import { UsersMeScheduledNotificationsPostRequest } from '@campsite/types'

import { apiErrorToast } from '@/utils/apiErrorToast'
import { apiClient, setTypedQueriesData } from '@/utils/queryClient'

const getMeScheduledNotifications = apiClient.users.getMeScheduledNotifications().requestKey()

export function useCreateScheduledNotification() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UsersMeScheduledNotificationsPostRequest) =>
      apiClient.users.postMeScheduledNotifications().request(data),
    onMutate: (data) => {
      const optimisticId = uuid()

      setTypedQueriesData(queryClient, getMeScheduledNotifications, (old) => {
        if (!old) return

        return [...old, { id: optimisticId, ...data }]
      })

      toast('Notification updated')

      // Return the optimisticId to be able to update the cache on success
      return { optimisticId }
    },
    onSuccess: (res, _, { optimisticId }) => {
      setTypedQueriesData(queryClient, getMeScheduledNotifications, (old: any) => {
        if (!old) return
        const optimisticRecord = old.find((n: any) => n.id === optimisticId)

        if (!optimisticRecord) return old

        return old.map((n: any) => (n.id === optimisticId ? res : n))
      })
    },
    onError: apiErrorToast
  })
}
