import { useQuery } from '@tanstack/react-query'

import { useScope } from '@/contexts/scope'
import { apiClient } from '@/utils/queryClient'

const query = apiClient.organizations.getMembersMePersonalCallRoom()

type Options = {
  orgSlug?: string
}

export function useGetPersonalCallRoom(options?: Options) {
  const { scope } = useScope()
  const orgSlug = options?.orgSlug || scope

  return useQuery({
    queryKey: query.requestKey(`${orgSlug}`),
    queryFn: () => query.request(`${orgSlug}`),
    enabled: !!orgSlug,
    staleTime: Infinity
  })
}
