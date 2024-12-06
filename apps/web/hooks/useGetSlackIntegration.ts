import { useQuery } from '@tanstack/react-query'

import { useScope } from '@/contexts/scope'
import { apiClient } from '@/utils/queryClient'

const query = apiClient.organizations.getIntegrationsSlack()

type Options = {
  orgSlug?: string
  enabled?: boolean
}

export function useGetSlackIntegration({ orgSlug, enabled = true }: Options = { enabled: true }) {
  const { scope } = useScope()
  const org = orgSlug ?? `${scope}`

  return useQuery({
    queryKey: query.requestKey(org),
    queryFn: () => query.request(org),
    enabled,
    staleTime: 1000 * 60, // 1 minute
    gcTime: 1000 * 60 * 60 // 1 hour
  })
}
