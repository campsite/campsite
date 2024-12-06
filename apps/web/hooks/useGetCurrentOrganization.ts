import { useQuery } from '@tanstack/react-query'

import { Organization } from '@campsite/types'

import { useScope } from '@/contexts/scope'
import { apiClient } from '@/utils/queryClient'

type Props<T> = {
  enabled?: boolean
  select?: (data: Organization) => T | undefined
}

const query = apiClient.organizations.getByOrgSlug()

export function useGetCurrentOrganization<T = Organization>({ enabled = true, select }: Props<T> = {}) {
  const { scope } = useScope()

  return useQuery({
    queryKey: query.requestKey(`${scope}`),
    queryFn: () => query.request(`${scope}`),
    select,
    enabled: enabled && !!scope,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: true
  })
}
