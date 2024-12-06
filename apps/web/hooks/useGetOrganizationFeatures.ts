import { useQuery } from '@tanstack/react-query'

import { useScope } from '@/contexts/scope'
import { apiClient } from '@/utils/queryClient'

const getFeatures = apiClient.organizations.getFeatures()

export function useGetCurrentOrganizationFeatures() {
  const { scope } = useScope()

  return useQuery({
    queryKey: getFeatures.requestKey(`${scope}`),
    queryFn: () => getFeatures.request(`${scope}`),
    enabled: !!scope,
    staleTime: 1000 * 60 * 60 // 1 hour
  })
}
