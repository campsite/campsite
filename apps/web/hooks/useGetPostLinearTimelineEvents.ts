import { useInfiniteQuery } from '@tanstack/react-query'

import { PublicOrganization } from '@campsite/types'

import { useScope } from '@/contexts/scope'
import { apiClient } from '@/utils/queryClient'

const getPostsLinearTimelineEvents = apiClient.organizations.getPostsLinearTimelineEvents()

interface Props {
  postId: string
  enabled?: boolean
  organization?: PublicOrganization
}

export function useGetPostLinearTimelineEvents({ postId, enabled = true, organization }: Props) {
  const { scope } = useScope()
  const orgSlug = organization?.slug || `${scope}`

  const result = useInfiniteQuery({
    queryKey: getPostsLinearTimelineEvents.requestKey({ orgSlug, postId }),
    queryFn: ({ pageParam }) =>
      getPostsLinearTimelineEvents.request({
        orgSlug,
        postId,
        after: pageParam,
        limit: 200
      }),
    initialPageParam: undefined as string | undefined,
    enabled: enabled && !!postId,
    getNextPageParam: (lastPage) => lastPage.next_cursor,
    getPreviousPageParam: (firstPage) => firstPage.prev_cursor,
    refetchOnWindowFocus: true
  })

  return {
    ...result,
    total: result.data?.pages?.slice(-1)?.[0]?.total_count
  }
}
