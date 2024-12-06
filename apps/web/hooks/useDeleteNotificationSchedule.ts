import { useMutation, useQueryClient } from '@tanstack/react-query'

import { apiClient, setTypedQueryData } from '@/utils/queryClient'

const getMeNotificationSchedule = apiClient.users.getMeNotificationSchedule()

export function useDeleteNotificationSchedule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => apiClient.users.deleteMeNotificationSchedule().request(),
    onMutate: () => {
      setTypedQueryData(queryClient, getMeNotificationSchedule.requestKey(), (old) => {
        if (!old) return old
        return { type: 'none' as const, custom: null }
      })
    }
  })
}
