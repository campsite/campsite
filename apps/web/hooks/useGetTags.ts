import { keepPreviousData, useInfiniteQuery, useQueryClient } from '@tanstack/react-query'

import { useScope } from '@/contexts/scope'
import { apiClient, setTypedQueryData } from '@/utils/queryClient'

type Options = {
  query?: string
}

const query = apiClient.organizations.getTags()

export function useGetTags(opts?: Options) {
  const { scope } = useScope()
  const queryClient = useQueryClient()

  const result = useInfiniteQuery({
    queryKey: query.requestKey({ orgSlug: `${scope}`, q: opts?.query }),
    queryFn: async ({ pageParam }) => {
      const result = await query.request({
        orgSlug: `${scope}`,
        after: pageParam,
        q: opts?.query?.replace('#', '').trim(),
        limit: 10
      })

      result.data.forEach((tag) => {
        setTypedQueryData(queryClient, apiClient.organizations.getTagsByTagName().requestKey(`${scope}`, tag.name), tag)
      })

      return result
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.next_cursor,
    getPreviousPageParam: (firstPage) => firstPage.prev_cursor,
    placeholderData: opts?.query ? keepPreviousData : undefined,
    enabled: !!scope
  })

  return {
    ...result,
    total: result.data?.pages?.slice(-1)?.[0]?.total_count
  }
}
