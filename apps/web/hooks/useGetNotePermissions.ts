import { useQuery } from '@tanstack/react-query'

import { useScope } from '@/contexts/scope'
import { apiClient } from '@/utils/queryClient'

const query = apiClient.organizations.getNotesPermissions()

type Props = {
  noteId: string
  enabled?: boolean
}

export function useGetNotePermissions({ noteId, enabled = true }: Props) {
  const { scope } = useScope()

  return useQuery({
    queryKey: query.requestKey(`${scope}`, noteId),
    queryFn: () => query.request(`${scope}`, noteId),
    enabled
  })
}
