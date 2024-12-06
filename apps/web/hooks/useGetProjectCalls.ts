import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query'

import { GetProjectsCallsParams } from '@campsite/types/generated'

import { useScope } from '@/contexts/scope'
import { apiClient } from '@/utils/queryClient'

type Props = {
  projectId: string
  query?: GetProjectsCallsParams['q']
}

const getProjectCalls = apiClient.organizations.getProjectsCalls()

export function useGetProjectCalls({ projectId, query }: Props) {
  const { scope } = useScope()

  return useInfiniteQuery({
    queryKey: getProjectCalls.requestKey({ orgSlug: `${scope}`, projectId, q: query }),
    queryFn: ({ pageParam }) => getProjectCalls.request({ orgSlug: `${scope}`, projectId, after: pageParam, q: query }),
    getNextPageParam: (lastPage) => lastPage.next_cursor,
    getPreviousPageParam: (firstPage) => firstPage.prev_cursor,
    initialPageParam: undefined as string | undefined,
    refetchOnWindowFocus: true,
    placeholderData: keepPreviousData,
    enabled: !!scope
  })
}
