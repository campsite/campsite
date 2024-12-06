import { keepPreviousData, useInfiniteQuery, useQueryClient } from '@tanstack/react-query'

import { useScope } from '@/contexts/scope'
import { apiClient, setTypedQueryData } from '@/utils/queryClient'

const query = apiClient.organizations.getProjects()

type Props = {
  query?: string
  archived?: boolean
  enabled?: boolean
}

export function useGetProjects({ query: searchQuery, archived = false, enabled = true }: Props = {}) {
  const { scope } = useScope()
  const queryClient = useQueryClient()
  const filter = archived ? 'archived' : undefined

  const result = useInfiniteQuery({
    queryKey: query.requestKey({ orgSlug: `${scope}`, q: searchQuery, filter }),
    queryFn: async ({ pageParam }) => {
      const results = await query.request({
        orgSlug: `${scope}`,
        after: pageParam,
        q: searchQuery,
        limit: 50,
        filter
      })

      results.data.forEach((project) => {
        setTypedQueryData(
          queryClient,
          apiClient.organizations.getProjectsByProjectId().requestKey(`${scope}`, project.id),
          project
        )
      })

      return results
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.next_cursor,
    getPreviousPageParam: (firstPage) => firstPage.prev_cursor,
    placeholderData: keepPreviousData,
    enabled: !!scope && enabled,
    staleTime: 1000
  })

  return {
    ...result,
    total: result.data?.pages?.slice(-1)?.[0]?.total_count
  }
}
