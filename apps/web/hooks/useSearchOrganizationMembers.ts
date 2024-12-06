import { keepPreviousData, useInfiniteQuery, useQueryClient } from '@tanstack/react-query'

import { OrganizationMembersGetRequest } from '@campsite/types'

import { useScope } from '@/contexts/scope'
import { apiClient, setTypedQueryData } from '@/utils/queryClient'

const query = apiClient.organizations.getMembers()

type Options = {
  query?: string
  status?: OrganizationMembersGetRequest['status']
  roles?: OrganizationMembersGetRequest['roles']
  enabled?: boolean
  scope?: string
  order?: OrganizationMembersGetRequest['order']
}

export function useSearchOrganizationMembers(opts?: Options) {
  const {
    query: searchQuery = '',
    status,
    roles,
    enabled = true,
    order = { by: 'last_seen_at', direction: 'desc' }
  } = opts || {}
  const { scope } = useScope()
  const queryClient = useQueryClient()
  const queryScope = opts?.scope || `${scope}`

  const result = useInfiniteQuery({
    queryKey: query.requestKey({ orgSlug: `${queryScope}`, q: searchQuery, status, roles, order }),
    queryFn: async ({ pageParam }) => {
      const results = await query.request({
        orgSlug: queryScope,
        status,
        roles,
        after: pageParam,
        q: searchQuery?.replace('@', '').trim(),
        limit: 50,
        order
      })

      results.data.forEach((member) => {
        setTypedQueryData(
          queryClient,
          apiClient.organizations.getMembersByUsername().requestKey(`${scope}`, member.user.username),
          member
        )
      })

      return results
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.next_cursor,
    getPreviousPageParam: (firstPage) => firstPage.prev_cursor,
    placeholderData: query ? keepPreviousData : undefined,
    enabled: !!scope && enabled
  })

  return {
    ...result,
    total: result.data?.pages?.slice(-1)?.[0]?.total_count
  }
}
