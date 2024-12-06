import { useInfiniteQuery } from '@tanstack/react-query'

import { useScope } from '@/contexts/scope'
import { apiClient } from '@/utils/queryClient'

const query = apiClient.organizations.getProjectsAddableMembers()

type Options = {
  projectId: string
  enabled?: boolean
}

export function useGetProjectAddableMembers({ projectId, enabled = true }: Options) {
  const { scope } = useScope()

  return useInfiniteQuery({
    queryKey: query.requestKey({ orgSlug: `${scope}`, projectId }),
    queryFn: ({ pageParam }) => query.request({ orgSlug: `${scope}`, projectId, after: pageParam, limit: 50 }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.next_cursor,
    getPreviousPageParam: (firstPage) => firstPage.prev_cursor,
    enabled: enabled && !!scope
  })
}
