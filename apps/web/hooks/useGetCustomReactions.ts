import { useInfiniteQuery } from '@tanstack/react-query'

import { useScope } from '@/contexts/scope'
import { apiClient } from '@/utils/queryClient'

const getCustomReactions = apiClient.organizations.getCustomReactions()

export function useGetCustomReactions() {
  const { scope } = useScope()

  return useInfiniteQuery({
    queryKey: getCustomReactions.requestKey({ orgSlug: `${scope}` }),
    queryFn: ({ pageParam }) => getCustomReactions.request({ orgSlug: `${scope}`, after: pageParam, limit: 50 }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.next_cursor,
    getPreviousPageParam: (firstPage) => firstPage.prev_cursor,
    enabled: !!scope,
    staleTime: 1000 * 60 * 60 // 1 hour
  })
}
