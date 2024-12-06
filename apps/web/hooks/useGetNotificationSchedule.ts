import { useQuery } from '@tanstack/react-query'

import { apiClient } from '@/utils/queryClient'

const query = apiClient.users.getMeNotificationSchedule()

export function useGetNotificationSchedule() {
  return useQuery({
    queryKey: query.requestKey(),
    queryFn: () => query.request(),
    staleTime: Infinity,
    gcTime: Infinity
  })
}
