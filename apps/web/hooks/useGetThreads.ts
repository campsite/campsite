import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { PublicOrganization } from '@campsite/types/generated'

import { useScope } from '@/contexts/scope'
import { apiClient } from '@/utils/queryClient'

type Options = {
  enabled?: boolean
  organization?: PublicOrganization
}

const query = apiClient.organizations.getThreads()

export function useGetThreads({ enabled = true, organization }: Options = {}) {
  const { scope } = useScope()
  const orgSlug = organization?.slug || `${scope}`

  const result = useQuery({
    queryKey: query.requestKey(orgSlug),
    queryFn: () => query.request(orgSlug),
    enabled,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: true,
    staleTime: 30 * 1000
  })

  return result
}
