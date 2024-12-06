import { useInfiniteQuery } from '@tanstack/react-query'

import { PublicOrganization } from '@campsite/types'

import { useScope } from '@/contexts/scope'
import { apiClient } from '@/utils/queryClient'

const getNotesTimelineEvents = apiClient.organizations.getNotesTimelineEvents()

interface Props {
  noteId: string
  enabled?: boolean
  organization?: PublicOrganization
}

export function useGetNoteTimelineEvents({ noteId, enabled = true, organization }: Props) {
  const { scope } = useScope()
  const orgSlug = organization?.slug || `${scope}`

  const result = useInfiniteQuery({
    queryKey: getNotesTimelineEvents.requestKey({ orgSlug, noteId }),
    queryFn: ({ pageParam }) =>
      getNotesTimelineEvents.request({
        orgSlug,
        noteId,
        after: pageParam,
        limit: 200
      }),
    initialPageParam: undefined as string | undefined,
    enabled: enabled && !!noteId,
    getNextPageParam: (lastPage) => lastPage.next_cursor,
    getPreviousPageParam: (firstPage) => firstPage.prev_cursor,
    refetchOnWindowFocus: true
  })

  return {
    ...result,
    total: result.data?.pages?.slice(-1)?.[0]?.total_count
  }
}
