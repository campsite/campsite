import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query'

import { useScope } from '@/contexts/scope'
import { apiClient } from '@/utils/queryClient'

const getIntegrationsSlackChannels = apiClient.organizations.getIntegrationsSlackChannels()

type Options = {
  query?: string
}

export function useGetSlackChannels({ query }: Options) {
  const { scope } = useScope()

  return useInfiniteQuery({
    queryKey: getIntegrationsSlackChannels.requestKey({ orgSlug: `${scope}`, q: query }),
    queryFn: ({ pageParam }) =>
      getIntegrationsSlackChannels.request({
        orgSlug: `${scope}`,
        after: pageParam,
        q: query,
        limit: 50
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.next_cursor,
    getPreviousPageParam: (firstPage) => firstPage.prev_cursor,
    placeholderData: keepPreviousData
  })
}
