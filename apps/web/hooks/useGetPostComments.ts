import { useInfiniteQuery } from '@tanstack/react-query'

import { PublicOrganization } from '@campsite/types'

import { useScope } from '@/contexts/scope'
import { apiClient } from '@/utils/queryClient'

const query = apiClient.organizations.getPostsComments()

interface Props {
  postId: string
  enabled?: boolean
  organization?: PublicOrganization
  refetchOnMount?: boolean
}

export function useGetPostComments({ postId, enabled = true, organization, refetchOnMount }: Props) {
  const { scope } = useScope()
  const orgSlug = organization?.slug || `${scope}`

  const result = useInfiniteQuery({
    queryKey: query.requestKey({ orgSlug, postId }),
    queryFn: ({ pageParam }) =>
      query.request({
        orgSlug,
        postId,
        after: pageParam,
        limit: 200
      }),
    initialPageParam: undefined as string | undefined,
    enabled: enabled && !!postId,
    refetchOnMount,
    getNextPageParam: (lastPage) => lastPage.next_cursor,
    getPreviousPageParam: (firstPage) => firstPage.prev_cursor,
    refetchOnWindowFocus: true
  })

  return {
    ...result,
    total: result.data?.pages?.slice(-1)?.[0]?.total_count
  }
}
