import { useMutation, useQueryClient } from '@tanstack/react-query'

import { useScope } from '@/contexts/scope'
import { useQueryNormalizer } from '@/utils/normy/QueryNormalizerProvider'
import { apiClient, setTypedQueryData } from '@/utils/queryClient'
import { createNormalizedOptimisticUpdate } from '@/utils/queryNormalization'

type Props = {
  noteId: string
  projectId: string
}

export function useCreateNotePin() {
  const { scope } = useScope()
  const queryNormalizer = useQueryNormalizer()
  const queryClient = useQueryClient()

  return useMutation({
    scope: { id: 'update-project-pin' },
    mutationFn: ({ noteId }: Props) => apiClient.organizations.postNotesPin().request(`${scope}`, noteId),
    onMutate: ({ noteId }) => {
      return createNormalizedOptimisticUpdate({
        queryNormalizer,
        type: 'note',
        id: noteId,
        // immediately add a value so the UI updates. value will be replaced with normalized server response
        update: { project_pin_id: 'tmp-pin-id' }
      })
    },
    onSuccess: (response, { projectId }) => {
      setTypedQueryData(
        queryClient,
        apiClient.organizations.getProjectsPins().requestKey(`${scope}`, `${projectId}`),
        (oldData) => {
          return {
            ...oldData,
            data: [...(oldData?.data ?? []), response.pin]
          }
        }
      )
    }
  })
}
