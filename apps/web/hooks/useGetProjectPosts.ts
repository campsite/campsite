import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query'

import { GetProjectsPostsParams } from '@campsite/types/generated'

import { useScope } from '@/contexts/scope'
import { apiClient } from '@/utils/queryClient'

const getProjectsPosts = apiClient.organizations.getProjectsPosts()

interface Props {
  projectId: string
  limit?: number
  enabled?: boolean
  order?: GetProjectsPostsParams['order']
  query?: GetProjectsPostsParams['q']
  hideResolved?: GetProjectsPostsParams['hide_resolved']
}

export function useGetProjectPosts({
  projectId,
  enabled = true,
  query: _query,
  order = { by: 'last_activity_at', direction: 'desc' },
  hideResolved = false
}: Props) {
  const query = _query ?? ''
  const { scope } = useScope()

  return useInfiniteQuery({
    queryKey: getProjectsPosts.requestKey({
      orgSlug: `${scope}`,
      projectId,
      order,
      q: query,
      hide_resolved: hideResolved
    }),
    queryFn: ({ pageParam }) =>
      getProjectsPosts.request({
        orgSlug: `${scope}`,
        projectId,
        order,
        limit: 20,
        after: pageParam,
        q: query,
        hide_resolved: hideResolved
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.next_cursor,
    getPreviousPageParam: (firstPage) => firstPage.prev_cursor,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: true,
    enabled
  })
}
