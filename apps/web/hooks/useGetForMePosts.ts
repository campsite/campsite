import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query'

import { GetMembersMeForMePostsParams } from '@campsite/types'

import { useScope } from '@/contexts/scope'
import { apiClient } from '@/utils/queryClient'

interface Options {
  enabled?: boolean
  order?: GetMembersMeForMePostsParams['order']
  query?: GetMembersMeForMePostsParams['q']
  hideResolved?: GetMembersMeForMePostsParams['hide_resolved']
}

const getMembersMeForMePosts = apiClient.organizations.getMembersMeForMePosts()

export function useGetForMePosts({
  enabled = true,
  order = { by: 'last_activity_at', direction: 'desc' },
  query: _query,
  hideResolved = false
}: Options = {}) {
  const query = _query ?? ''
  const { scope } = useScope()

  return useInfiniteQuery({
    queryKey: getMembersMeForMePosts.requestKey({ orgSlug: `${scope}`, order, q: query, hide_resolved: hideResolved }),
    queryFn: ({ pageParam }) =>
      getMembersMeForMePosts.request({
        orgSlug: `${scope}`,
        order,
        q: query,
        limit: 20,
        after: pageParam,
        hide_resolved: hideResolved
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.next_cursor,
    getPreviousPageParam: (firstPage) => firstPage.prev_cursor,
    placeholderData: keepPreviousData,
    enabled: !!scope && enabled
  })
}
