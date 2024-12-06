import { useQuery } from '@tanstack/react-query'

import { useScope } from '@/contexts/scope'
import { apiClient } from '@/utils/queryClient'

const query = apiClient.organizations.getMembersMeStatuses()

export function useRecentStatuses() {
  const { scope } = useScope()

  return useQuery({
    queryKey: query.requestKey(`${scope}`),
    queryFn: () => query.request(`${scope}`)
  })
}
