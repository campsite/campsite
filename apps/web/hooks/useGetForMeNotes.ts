import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query'

import { GetMembersMeForMeNotesParams } from '@campsite/types'

import { useScope } from '@/contexts/scope'
import { apiClient } from '@/utils/queryClient'

type Props = {
  enabled?: boolean
  order?: GetMembersMeForMeNotesParams['order']
  query?: GetMembersMeForMeNotesParams['q']
}

const getMembersMeForMeNotes = apiClient.organizations.getMembersMeForMeNotes()

export function useGetForMeNotes({ enabled = true, order = { by: 'created_at', direction: 'desc' }, query }: Props) {
  const { scope } = useScope()

  return useInfiniteQuery({
    queryKey: getMembersMeForMeNotes.requestKey({ orgSlug: `${scope}`, order, q: query }),
    queryFn: ({ pageParam }) =>
      getMembersMeForMeNotes.request({ orgSlug: `${scope}`, after: pageParam, order, q: query }),
    getNextPageParam: (lastPage) => lastPage.next_cursor,
    getPreviousPageParam: (firstPage) => firstPage.prev_cursor,
    initialPageParam: undefined as string | undefined,
    enabled,
    refetchOnWindowFocus: true,
    placeholderData: keepPreviousData
  })
}
