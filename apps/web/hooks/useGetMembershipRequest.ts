import { useQuery } from '@tanstack/react-query'

import { useScope } from '@/contexts/scope'
import { apiClient } from '@/utils/queryClient'

const query = apiClient.organizations.getMembershipRequest()

type Options = {
  enabled?: boolean
}

export function useGetMembershipRequest(options?: Options) {
  const enabled = options?.enabled ?? true
  const { scope } = useScope()

  return useQuery({
    queryKey: query.requestKey(`${scope}`),
    queryFn: () => query.request(`${scope}`),
    enabled: enabled && !!scope
  })
}
