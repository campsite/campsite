import { useQuery } from '@tanstack/react-query'

import { useScope } from '@/contexts/scope'
import { apiClient } from '@/utils/queryClient'

const getCustomReactionsPacks = apiClient.organizations.getCustomReactionsPacks()

export function useGetCustomReactionsPacks() {
  const { scope } = useScope()

  return useQuery({
    queryKey: getCustomReactionsPacks.requestKey(`${scope}`),
    queryFn: () => getCustomReactionsPacks.request(`${scope}`),
    enabled: !!scope
  })
}
