import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query'

import { OrganizationMembershipViewerNotesGetRequest } from '@campsite/types'

import { useScope } from '@/contexts/scope'
import { apiClient } from '@/utils/queryClient'

type Props = {
  enabled?: boolean
  order?: OrganizationMembershipViewerNotesGetRequest['order']
  query?: OrganizationMembershipViewerNotesGetRequest['q']
}

const getMembersMeViewerNotes = apiClient.organizations.getMembersMeViewerNotes()

export function useGetCurrentMemberNotes({
  enabled = true,
  order = { by: 'created_at', direction: 'desc' },
  query
}: Props) {
  const { scope } = useScope()

  return useInfiniteQuery({
    queryKey: getMembersMeViewerNotes.requestKey({ orgSlug: `${scope}`, order, q: query }),
    queryFn: ({ pageParam }) =>
      getMembersMeViewerNotes.request({ orgSlug: `${scope}`, after: pageParam, order, q: query }),
    getNextPageParam: (lastPage) => lastPage.next_cursor,
    getPreviousPageParam: (firstPage) => firstPage.prev_cursor,
    initialPageParam: undefined as string | undefined,
    enabled,
    refetchOnWindowFocus: true,
    placeholderData: keepPreviousData
  })
}
