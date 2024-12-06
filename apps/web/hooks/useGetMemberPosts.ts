import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query'

import { GetMembersPostsParams } from '@campsite/types'

import { useScope } from '@/contexts/scope'
import { apiClient } from '@/utils/queryClient'

const query = apiClient.organizations.getMembersPosts()

interface Props {
  username: string
  order?: GetMembersPostsParams['order']
  enabled?: boolean
}

export function useGetMemberPosts({
  username,
  order = { by: 'published_at', direction: 'desc' },
  enabled = true
}: Props) {
  const { scope } = useScope()

  return useInfiniteQuery({
    queryKey: query.requestKey({ orgSlug: `${scope}`, username, order }),
    queryFn: ({ pageParam }) =>
      query.request({
        orgSlug: `${scope}`,
        username,
        order,
        limit: 20,
        after: pageParam
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.next_cursor,
    getPreviousPageParam: (firstPage) => firstPage.prev_cursor,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: true,
    enabled: !!username && enabled
  })
}
