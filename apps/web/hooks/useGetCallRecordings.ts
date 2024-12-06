import { useInfiniteQuery } from '@tanstack/react-query'

import { useScope } from '@/contexts/scope'
import { apiClient } from '@/utils/queryClient'

const query = apiClient.organizations.getCallsRecordings()

type Props = {
  callId: string
  enabled?: boolean
}

export function useGetCallRecordings({ callId, enabled = true }: Props) {
  const { scope } = useScope()

  return useInfiniteQuery({
    queryKey: query.requestKey({ orgSlug: `${scope}`, callId }),
    queryFn: ({ pageParam }) => query.request({ orgSlug: `${scope}`, callId, after: pageParam }),
    getNextPageParam: (lastPage) => lastPage.next_cursor,
    getPreviousPageParam: (firstPage) => firstPage.prev_cursor,
    initialPageParam: undefined as string | undefined,
    enabled: enabled && !!scope
  })
}
