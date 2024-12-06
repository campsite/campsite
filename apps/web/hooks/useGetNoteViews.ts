import { useQuery } from '@tanstack/react-query'

import { useScope } from '@/contexts/scope'
import { apiClient } from '@/utils/queryClient'

const query = apiClient.organizations.getNotesViews()

type Props = {
  noteId: string
  enabled?: boolean
}

export function useGetNoteViews({ noteId, enabled = true }: Props) {
  const { scope } = useScope()

  return useQuery({
    queryKey: query.requestKey(`${scope}`, noteId),
    queryFn: () => query.request(`${scope}`, noteId),
    enabled: enabled && !!noteId,
    refetchOnWindowFocus: true
  })
}
