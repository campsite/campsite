import { useQuery } from '@tanstack/react-query'

import { useScope } from '@/contexts/scope'
import { apiClient } from '@/utils/queryClient'

const query = apiClient.organizations.getIntegrationsSlackChannelsByProviderChannelId()

export function useGetSlackChannel({ providerChannelId }: { providerChannelId?: string | null }) {
  const { scope } = useScope()

  return useQuery({
    queryKey: query.requestKey(`${scope}`, `${providerChannelId}`),
    queryFn: () => query.request(`${scope}`, `${providerChannelId}`),
    enabled: !!providerChannelId
  })
}
