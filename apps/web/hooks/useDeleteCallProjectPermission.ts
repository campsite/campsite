import { useMutation } from '@tanstack/react-query'

import { useScope } from '@/contexts/scope'
import { useQueryNormalizer } from '@/utils/normy/QueryNormalizerProvider'
import { apiClient } from '@/utils/queryClient'
import { createNormalizedOptimisticUpdate } from '@/utils/queryNormalization'

type Props = {
  callId: string
}

export function useDeleteCallProjectPermission() {
  const { scope } = useScope()
  const queryNormalizer = useQueryNormalizer()

  return useMutation({
    scope: { id: 'update-project-permission' },
    mutationFn: ({ callId }: Props) =>
      apiClient.organizations.deleteCallsProjectPermission().request(`${scope}`, callId),
    onMutate: ({ callId }) => {
      // TODO: Update getProjectPins cache when call pins implemented.

      return createNormalizedOptimisticUpdate({
        queryNormalizer,
        type: 'call',
        id: callId,
        update: {
          project_permission: 'none',
          project: null
          // TODO: Update project_pin_id when call pins implemented.
        }
      })
    }
  })
}
