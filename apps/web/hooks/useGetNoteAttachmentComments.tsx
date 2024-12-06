import { useInfiniteQuery } from '@tanstack/react-query'

import { useScope } from '@/contexts/scope'
import { apiClient } from '@/utils/queryClient'

const query = apiClient.organizations.getNotesAttachmentsComments()

interface Props {
  noteId: string
  attachmentId?: string
  enabled?: boolean
}

export function useGetNoteAttachmentComments({ noteId, attachmentId, enabled = true }: Props) {
  const { scope } = useScope()

  const result = useInfiniteQuery({
    queryKey: query.requestKey({ orgSlug: `${scope}`, noteId, attachmentId: `${attachmentId}` }),
    queryFn: ({ pageParam }) =>
      query.request({
        orgSlug: `${scope}`,
        noteId,
        attachmentId: attachmentId || '',
        after: pageParam,
        limit: 200
      }),
    enabled: enabled && !!attachmentId,
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.next_cursor,
    getPreviousPageParam: (firstPage) => firstPage.prev_cursor,
    refetchOnWindowFocus: true
  })

  return {
    ...result,
    total: result.data?.pages?.slice(-1)?.[0]?.total_count
  }
}
