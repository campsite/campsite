import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query'

import { GetMembersMeViewerPostsParams } from '@campsite/types'

import { useScope } from '@/contexts/scope'
import { apiClient } from '@/utils/queryClient'

type Options = {
  enabled?: boolean
  order?: GetMembersMeViewerPostsParams['order']
  query?: GetMembersMeViewerPostsParams['q']
}

const getMembersMeViewerPosts = apiClient.organizations.getMembersMeViewerPosts()

export function useGetCurrentMemberPosts({
  enabled = true,
  order = { by: 'last_activity_at', direction: 'desc' },
  query: _query
}: Options = {}) {
  const query = _query ?? ''
  const { scope } = useScope()

  return useInfiniteQuery({
    queryKey: getMembersMeViewerPosts.requestKey({ orgSlug: `${scope}`, order, q: query }),
    queryFn: ({ pageParam }) =>
      getMembersMeViewerPosts.request({
        orgSlug: `${scope}`,
        order,
        q: query,
        limit: 20,
        after: pageParam
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.next_cursor,
    getPreviousPageParam: (firstPage) => firstPage.prev_cursor,
    placeholderData: keepPreviousData,
    enabled: !!scope && enabled
  })
}
