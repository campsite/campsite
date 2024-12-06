import { useMutation } from '@tanstack/react-query'

import { useScope } from '@/contexts/scope'
import { useQueryNormalizer } from '@/utils/normy/QueryNormalizerProvider'
import { apiClient } from '@/utils/queryClient'
import { createNormalizedOptimisticUpdate } from '@/utils/queryNormalization'

export function useDeleteProjectSubscription(projectId: string) {
  const { scope } = useScope()
  const queryNormalizer = useQueryNormalizer()

  return useMutation({
    scope: { id: 'update-project-subscription' },
    mutationFn: () => apiClient.organizations.deleteProjectsSubscription().request(`${scope}`, projectId),
    onMutate: () => {
      return createNormalizedOptimisticUpdate({
        queryNormalizer,
        type: 'project',
        id: projectId,
        update: { viewer_has_subscribed: false, viewer_subscription: 'none' }
      })
    }
  })
}
