import { useQuery } from '@tanstack/react-query'

import { useScope } from '@/contexts/scope'
import { apiClient } from '@/utils/queryClient'

const query = apiClient.organizations.getThreadsOauthApplications()

export function useGetThreadOauthApps({ threadId, enabled = true }: { threadId: string; enabled?: boolean }) {
  const { scope } = useScope()

  return useQuery({
    queryKey: query.requestKey(`${scope}`, threadId),
    queryFn: () => query.request(`${scope}`, threadId),
    enabled
  })
}
