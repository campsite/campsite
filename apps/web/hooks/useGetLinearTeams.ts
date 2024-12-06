import { useQuery } from '@tanstack/react-query'

import { useScope } from '@/contexts/scope'
import { useGetLinearIntegration } from '@/hooks/useGetLinearIntegration'
import { apiClient } from '@/utils/queryClient'

const query = apiClient.organizations.getIntegrationsLinearTeams()

export function useGetLinearTeams() {
  const { scope } = useScope()
  const { data: hasIntegration } = useGetLinearIntegration()

  return useQuery({
    queryKey: query.requestKey(`${scope}`),
    queryFn: () => query.request(`${scope}`),
    enabled: !!hasIntegration
  })
}
