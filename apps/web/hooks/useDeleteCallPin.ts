import { useMutation, useQueryClient } from '@tanstack/react-query'

import { useScope } from '@/contexts/scope'
import { useQueryNormalizer } from '@/utils/normy/QueryNormalizerProvider'
import { apiClient, setTypedQueryData } from '@/utils/queryClient'
import { createNormalizedOptimisticUpdate } from '@/utils/queryNormalization'

type Props = {
  pinId: string
  callId: string
  projectId: string
}

export function useDeleteCallPin() {
  const { scope } = useScope()
  const queryNormalizer = useQueryNormalizer()
  const queryClient = useQueryClient()

  return useMutation({
    scope: { id: 'update-project-pin' },
    mutationFn: ({ pinId }: Props) => apiClient.organizations.deletePinsById().request(`${scope}`, pinId),
    onMutate: ({ callId, projectId, pinId }) => {
      setTypedQueryData(
        queryClient,
        apiClient.organizations.getProjectsPins().requestKey(`${scope}`, `${projectId}`),
        (oldData) => {
          return {
            ...oldData,
            data: oldData?.data.filter((pin) => pin.id !== pinId) || []
          }
        }
      )

      return createNormalizedOptimisticUpdate({
        queryNormalizer,
        type: 'call',
        id: callId,
        update: { project_pin_id: null }
      })
    },
    onError: (_err, { projectId }) => {
      queryClient.invalidateQueries({
        queryKey: apiClient.organizations.getProjectsPins().requestKey(`${scope}`, `${projectId}`)
      })
    }
  })
}
