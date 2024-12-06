import { useQuery } from '@tanstack/react-query'

import { apiClient } from '@/utils/queryClient'

const query = apiClient.organizations.getMembersMeSlackNotificationPreference()

export function useGetSlackNotificationPreference(scope: string) {
  return useQuery({
    queryKey: query.requestKey(`${scope}`),
    queryFn: () => query.request(`${scope}`)
  })
}
