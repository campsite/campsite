import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query'

import { useScope } from '@/contexts/scope'
import { apiClient } from '@/utils/queryClient'

type Props = {
  threadId?: string
  enabled?: boolean
}

const query = apiClient.organizations.getThreadsMessages()

export function useGetMessages({ threadId, enabled = true }: Props) {
  const { scope } = useScope()

  return useInfiniteQuery({
    queryKey: query.requestKey({ orgSlug: `${scope}`, threadId: `${threadId}` }),
    queryFn: ({ pageParam }) =>
      query.request({
        orgSlug: `${scope}`,
        threadId: `${threadId}`,
        limit: 20,
        after: pageParam
      }),
    enabled: enabled && !!threadId,
    getNextPageParam: (lastPage) => lastPage.next_cursor,
    getPreviousPageParam: (firstPage) => firstPage.prev_cursor,
    placeholderData: keepPreviousData,
    initialPageParam: undefined as string | undefined,
    refetchOnWindowFocus: true,
    staleTime: 30 * 1000
  })
}
