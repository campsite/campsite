import { useQuery } from '@tanstack/react-query'

import { useScope } from '@/contexts/scope'
import { apiClient } from '@/utils/queryClient'

const query = apiClient.organizations.getThreadsMyMembership()

export function useGetThreadMembership({ threadId, enabled = true }: { threadId: string | null; enabled?: boolean }) {
  const { scope } = useScope()

  return useQuery({
    queryKey: query.requestKey(`${scope}`, `${threadId}`),
    queryFn: () => query.request(`${scope}`, `${threadId}`),
    enabled: enabled && !!scope && !!threadId
  })
}
