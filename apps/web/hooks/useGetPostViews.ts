import { useInfiniteQuery } from '@tanstack/react-query'

import { useScope } from '@/contexts/scope'
import { apiClient } from '@/utils/queryClient'

const query = apiClient.organizations.getPostsViews()

interface Props {
  postId: string
  enabled?: boolean
}

export function useGetPostViews({ postId, enabled = true }: Props) {
  const { scope } = useScope()

  return useInfiniteQuery({
    queryKey: query.requestKey({ orgSlug: `${scope}`, postId }),
    queryFn: ({ pageParam }) =>
      query.request({
        orgSlug: `${scope}`,
        postId,
        after: pageParam
      }),
    enabled,
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.next_cursor,
    getPreviousPageParam: (firstPage) => firstPage.prev_cursor
  })
}
