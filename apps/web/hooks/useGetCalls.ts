import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query'

import { OrganizationCallsGetRequest } from '@campsite/types/generated'

import { useScope } from '@/contexts/scope'
import { apiClient } from '@/utils/queryClient'

type Props = {
  enabled?: boolean
  filter?: OrganizationCallsGetRequest['filter']
  limit?: number
  query?: OrganizationCallsGetRequest['q']
}

const getCalls = apiClient.organizations.getCalls()

export function useGetCalls(props: Props) {
  const { enabled = true, filter, limit = 10 } = props
  const { scope } = useScope()

  return useInfiniteQuery({
    queryKey: getCalls.requestKey({ orgSlug: `${scope}`, filter, limit, q: props.query }),
    queryFn: ({ pageParam }) =>
      getCalls.request({ orgSlug: `${scope}`, after: pageParam, filter, limit, q: props.query }),
    getNextPageParam: (lastPage) => lastPage.next_cursor,
    getPreviousPageParam: (firstPage) => firstPage.prev_cursor,
    initialPageParam: undefined as string | undefined,
    enabled,
    placeholderData: keepPreviousData
  })
}
