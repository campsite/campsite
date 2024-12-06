import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query'

import { GetMembersMePersonalDraftPostsParams } from '@campsite/types'

import { useScope } from '@/contexts/scope'
import { apiClient } from '@/utils/queryClient'

type Options = {
  enabled?: boolean
  order?: GetMembersMePersonalDraftPostsParams['order']
}

const getMembersMePersonalDraftPosts = apiClient.organizations.getMembersMePersonalDraftPosts()

export function useGetPersonalDraftPosts({
  enabled = true,
  order = { by: 'last_activity_at', direction: 'desc' }
}: Options = {}) {
  const { scope } = useScope()

  return useInfiniteQuery({
    queryKey: getMembersMePersonalDraftPosts.requestKey({ orgSlug: `${scope}`, order }),
    queryFn: ({ pageParam }) =>
      getMembersMePersonalDraftPosts.request({
        orgSlug: `${scope}`,
        order,
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
