import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query'

import { GetMembersMeNotificationsParams, PublicOrganization } from '@campsite/types'

import { useScope } from '@/contexts/scope'
import { apiClient } from '@/utils/queryClient'

const query = apiClient.organizations.getMembersMeNotifications()

interface Props {
  enabled?: boolean
  unreadOnly?: boolean
  organization?: PublicOrganization
  filter?: GetMembersMeNotificationsParams['filter']
}

export function useGetNotifications({ enabled = true, unreadOnly = false, organization, filter }: Props = {}) {
  const { scope } = useScope()
  const orgSlug = organization?.slug || `${scope}`

  return useInfiniteQuery({
    queryKey: query.requestKey({
      orgSlug,
      unread: unreadOnly,
      filter
    }),
    queryFn: ({ pageParam }) =>
      query.request({
        orgSlug,
        after: pageParam,
        limit: 20,
        unread: unreadOnly,
        filter
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
