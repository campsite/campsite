import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query'

import { useScope } from '@/contexts/scope'
import { apiClient } from '@/utils/queryClient'

const getOrganizationInvitations = apiClient.organizations.getInvitations()

type Props = {
  query?: string
  roleCounted?: boolean
}

export function useGetOrganizationInvitations({ query, roleCounted = false }: Props = {}) {
  const { scope } = useScope()

  const result = useInfiniteQuery({
    queryKey: getOrganizationInvitations.requestKey({
      orgSlug: `${scope}`,
      q: query,
      role_counted: roleCounted
    }),
    queryFn: ({ pageParam }) =>
      getOrganizationInvitations.request({
        orgSlug: `${scope}`,
        q: query,
        after: pageParam,
        role_counted: roleCounted
      }),
    initialPageParam: undefined as string | undefined,
    placeholderData: query ? keepPreviousData : undefined,
    getNextPageParam: (lastPage) => lastPage.next_cursor,
    getPreviousPageParam: (firstPage) => firstPage.prev_cursor
  })

  return {
    ...result,
    total: result.data?.pages?.slice(-1)?.[0]?.total_count
  }
}
