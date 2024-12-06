import { useMutation } from '@tanstack/react-query'

import { useScope } from '@/contexts/scope'
import { useQueryNormalizer } from '@/utils/normy/QueryNormalizerProvider'
import { apiClient } from '@/utils/queryClient'
import { createNormalizedOptimisticUpdate } from '@/utils/queryNormalization'

type Props = {
  noteId: string
  title?: string
}

export function useUpdateNote() {
  const { scope } = useScope()
  const queryNormalizer = useQueryNormalizer()

  return useMutation({
    mutationFn: ({ noteId, ...data }: Props) =>
      apiClient.organizations.putNotesById().request(`${scope}`, `${noteId}`, data),
    onMutate: async ({ noteId, ...data }) => {
      return createNormalizedOptimisticUpdate({
        queryNormalizer,
        type: 'note',
        id: noteId,
        update: {
          ...data,
          last_activity_at: new Date().toISOString()
        }
      })
    }
  })
}
