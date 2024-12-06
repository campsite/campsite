import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query'

import { useScope } from '@/contexts/scope'
import { apiClient } from '@/utils/queryClient'

const query = apiClient.organizations.getTagsPosts()

type Props = {
  tagName: string
  enabled?: boolean
}

export function useGetTagPosts({ tagName, enabled = true }: Props) {
  const { scope } = useScope()

  return useInfiniteQuery({
    queryKey: query.requestKey({ orgSlug: `${scope}`, tagName }),
    queryFn: ({ pageParam }) =>
      query.request({
        orgSlug: `${scope}`,
        tagName,
        limit: 20,
        after: pageParam
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.next_cursor,
    getPreviousPageParam: (firstPage) => firstPage.prev_cursor,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: true,
    enabled
  })
}
