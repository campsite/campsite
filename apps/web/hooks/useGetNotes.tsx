import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query'

import { OrganizationNotesGetRequest } from '@campsite/types'

import { useScope } from '@/contexts/scope'
import { apiClient } from '@/utils/queryClient'

type Props = {
  enabled?: boolean
  order?: OrganizationNotesGetRequest['order']
  query?: OrganizationNotesGetRequest['q']
}

const getNotes = apiClient.organizations.getNotes()

export function useGetNotes({ enabled = true, order = { by: 'created_at', direction: 'desc' }, query }: Props) {
  const { scope } = useScope()

  return useInfiniteQuery({
    queryKey: getNotes.requestKey({ orgSlug: `${scope}`, order, q: query }),
    queryFn: ({ pageParam }) => getNotes.request({ orgSlug: `${scope}`, after: pageParam, order, q: query }),
    getNextPageParam: (lastPage) => lastPage.next_cursor,
    getPreviousPageParam: (firstPage) => firstPage.prev_cursor,
    initialPageParam: undefined as string | undefined,
    enabled,
    refetchOnWindowFocus: true,
    placeholderData: keepPreviousData
  })
}
