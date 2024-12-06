import { useInfiniteQuery } from '@tanstack/react-query'

import { useScope } from '@/contexts/scope'
import { apiClient } from '@/utils/queryClient'

const getFollowUps = apiClient.organizations.getFollowUps()

export function useGetFollowUps({ enabled = true }: { enabled?: boolean } = {}) {
  const { scope } = useScope()

  return useInfiniteQuery({
    queryKey: getFollowUps.requestKey({ orgSlug: `${scope}` }),
    queryFn: ({ pageParam }) => getFollowUps.request({ orgSlug: `${scope}`, after: pageParam, limit: 10 }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.next_cursor,
    getPreviousPageParam: (firstPage) => firstPage.prev_cursor,
    enabled: !!scope && !!enabled
  })
}
