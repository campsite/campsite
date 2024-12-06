import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query'

import { PublicOrganization } from '@campsite/types'

import { useScope } from '@/contexts/scope'
import { apiClient } from '@/utils/queryClient'

const query = apiClient.organizations.getMembersMeArchivedNotifications()

interface Props {
  enabled?: boolean
  organization?: PublicOrganization
}

export function useGetArchivedNotifications({ enabled = true, organization }: Props = {}) {
  const { scope } = useScope()
  const orgSlug = organization?.slug || `${scope}`

  return useInfiniteQuery({
    queryKey: query.requestKey({
      orgSlug
    }),
    queryFn: ({ pageParam }) =>
      query.request({
        orgSlug,
        after: pageParam,
        limit: 20
      }),
    getNextPageParam: (lastPage) => lastPage.next_cursor,
    getPreviousPageParam: (firstPage) => firstPage.prev_cursor,
    placeholderData: keepPreviousData,
    initialPageParam: undefined as string | undefined,
    refetchInterval: 30 * 1000,
    refetchOnWindowFocus: true,
    enabled
  })
}
