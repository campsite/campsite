import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query'

import { GetPostsParams } from '@campsite/types/generated'

import { useScope } from '@/contexts/scope'
import { apiClient } from '@/utils/queryClient'

type Options = {
  limit?: number
  enabled?: boolean
  order?: GetPostsParams['order']
  query?: GetPostsParams['q']
}

const getPosts = apiClient.organizations.getPosts()

export function useGetPosts(options?: Options) {
  const enabled = options?.enabled ?? true
  const order = options?.order ?? { by: 'last_activity_at', direction: 'desc' }
  const { scope } = useScope()
  const q = options?.query ?? ''

  return useInfiniteQuery({
    queryKey: getPosts.requestKey({ orgSlug: `${scope}`, order, q }),
    queryFn: ({ pageParam }) => getPosts.request({ orgSlug: `${scope}`, order, limit: 20, after: pageParam, q }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.next_cursor,
    getPreviousPageParam: (firstPage) => firstPage.prev_cursor,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: true,
    enabled
  })
}
