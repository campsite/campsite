import { useQuery } from '@tanstack/react-query'

import { apiClient } from '@/utils/queryClient'

const query = apiClient.integrations.getIntegrationsCalDotComIntegration()

export function useGetCalDotComIntegration() {
  return useQuery({
    queryKey: query.requestKey(),
    queryFn: () => query.request()
  })
}
