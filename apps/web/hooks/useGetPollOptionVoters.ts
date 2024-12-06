import { useInfiniteQuery } from '@tanstack/react-query'

import { useScope } from '@/contexts/scope'
import { apiClient } from '@/utils/queryClient'

const query = apiClient.organizations.getPostsPollOptionsVoters()

type Props = {
  postId: string
  pollOptionId: string
  enabled?: boolean
}

export function useGetPollOptionVoters({ postId, pollOptionId, enabled = true }: Props) {
  const { scope } = useScope()

  const result = useInfiniteQuery({
    queryKey: query.requestKey({ orgSlug: `${scope}`, postId, pollOptionId }),
    queryFn: ({ pageParam }) =>
      query.request({
        orgSlug: `${scope}`,
        postId,
        pollOptionId,
        after: pageParam,
        limit: 5
      }),
    staleTime: 1000,
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.next_cursor,
    getPreviousPageParam: (firstPage) => firstPage.prev_cursor,
    enabled: enabled && !!scope && !!postId && !!pollOptionId
  })

  return {
    ...result,
    total: result.data?.pages?.slice(-1)?.[0]?.total_count
  }
}
