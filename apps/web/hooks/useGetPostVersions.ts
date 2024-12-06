import { useQuery } from '@tanstack/react-query'

import { useScope } from '@/contexts/scope'
import { apiClient } from '@/utils/queryClient'

const query = apiClient.organizations.getPostsVersions()

type Options = {
  enabled?: boolean
  keepPreviousData?: boolean
  gcTime?: number
  staleTime?: number
}

export function useGetPostVersions(id: string, options: Options = {}) {
  const { scope } = useScope()
  const { enabled = true, ...rest } = options

  return useQuery({
    queryKey: query.requestKey(`${scope}`, id),
    queryFn: () => query.request(`${scope}`, id),
    enabled,
    ...rest
  })
}
