import { useQuery } from '@tanstack/react-query'

import { useScope } from '@/contexts/scope'
import { apiClient } from '@/utils/queryClient'

const query = apiClient.organizations.getTagsByTagName()

export function useGetTag(name: string, enabled: boolean = true) {
  const { scope } = useScope()

  return useQuery({
    queryKey: query.requestKey(`${scope}`, name),
    queryFn: () => query.request(`${scope}`, name),
    enabled,
    staleTime: Infinity,
    gcTime: Infinity
  })
}
