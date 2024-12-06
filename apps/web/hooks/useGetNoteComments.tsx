import { useInfiniteQuery } from '@tanstack/react-query'

import { PublicOrganization } from '@campsite/types'

import { useScope } from '@/contexts/scope'
import { apiClient } from '@/utils/queryClient'

const query = apiClient.organizations.getNotesComments()

interface Props {
  noteId: string
  enabled?: boolean
  organization?: PublicOrganization
  refetchOnMount?: boolean
}

export function useGetNoteComments({ noteId, enabled = true, organization, refetchOnMount }: Props) {
  const { scope } = useScope()
  const orgSlug = organization?.slug || `${scope}`

  const result = useInfiniteQuery({
    queryKey: query.requestKey({ orgSlug, noteId }),
    queryFn: ({ pageParam }) =>
      query.request({
        orgSlug,
        noteId,
        after: pageParam,
        limit: 200
      }),
    enabled,
    getNextPageParam: (lastPage) => lastPage.next_cursor,
    getPreviousPageParam: (firstPage) => firstPage.prev_cursor,
    refetchOnWindowFocus: true,
    initialPageParam: undefined as string | undefined,
    refetchOnMount
  })

  return {
    ...result,
    total: result.data?.pages?.slice(-1)?.[0]?.total_count
  }
}
