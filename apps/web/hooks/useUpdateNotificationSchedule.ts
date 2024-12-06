import { useMutation, useQueryClient } from '@tanstack/react-query'

import { UsersMeNotificationSchedulePutRequest } from '@campsite/types'

import { apiClient, setTypedQueryData } from '@/utils/queryClient'

const getMeNotificationSchedule = apiClient.users.getMeNotificationSchedule()

export function useUpdateNotificationSchedule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UsersMeNotificationSchedulePutRequest) =>
      apiClient.users.putMeNotificationSchedule().request(data),
    onMutate: (data) => {
      setTypedQueryData(queryClient, getMeNotificationSchedule.requestKey(), (old) => {
        if (!old) return old
        return { type: 'custom' as const, custom: data }
      })
    }
  })
}
