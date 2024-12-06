import { useInfiniteQuery } from '@tanstack/react-query'

import { GetGifsParams } from '@campsite/types/generated'

import { useScope } from '@/contexts/scope'
import { apiClient } from '@/utils/queryClient'

const getGifs = apiClient.organizations.getGifs()

export function useGetGifs({ q, enabled }: Pick<GetGifsParams, 'q'> & { enabled?: boolean }) {
  const { scope } = useScope()

  return useInfiniteQuery({
    queryKey: getGifs.requestKey({ orgSlug: `${scope}`, q }),
    queryFn: ({ pageParam }) =>
      getGifs.request({
        orgSlug: `${scope}`,
        q,
        after: pageParam,
        // make the limit divisible by 3 so items uniformly fill the 3 column grid
        limit: 12
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.next_cursor,
    enabled: !!scope && !!enabled,
    staleTime: 1000 * 60 * 60 // 1 hour
  })
}
