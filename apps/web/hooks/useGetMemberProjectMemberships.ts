import { useQuery } from '@tanstack/react-query'

import { useScope } from '@/contexts/scope'
import { apiClient } from '@/utils/queryClient'

const query = apiClient.organizations.getMembersProjectMemberships()

type Options = {
  memberUsername: string
  enabled?: boolean
}

export function useGetMemberProjectMemberships({ memberUsername, enabled = true }: Options) {
  const { scope } = useScope()

  return useQuery({
    queryKey: query.requestKey(`${scope}`, memberUsername),
    queryFn: () => query.request(`${scope}`, memberUsername),
    enabled: enabled && !!scope
  })
}
