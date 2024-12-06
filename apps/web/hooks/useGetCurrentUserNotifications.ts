import { useQuery } from '@tanstack/react-query'

import { apiClient } from '@/utils/queryClient'

const query = apiClient.users.getMeScheduledNotifications()

export function useGetCurrentUserNotifications() {
  return useQuery({
    queryKey: query.requestKey(),
    queryFn: () => query.request()
  })
}
