import { useMutation } from '@tanstack/react-query'

import { useScope } from '@/contexts/scope'
import { useQueryNormalizer } from '@/utils/normy/QueryNormalizerProvider'
import { apiClient } from '@/utils/queryClient'
import { setNormalizedData } from '@/utils/queryNormalization'

const postThreadsNotificationForces = apiClient.organizations.postThreadsNotificationForces()

export function useCreateThreadNotificationForce() {
  const { scope } = useScope()
  const queryNormalizer = useQueryNormalizer()

  return useMutation({
    mutationFn: ({ threadId }: { threadId: string }) => postThreadsNotificationForces.request(`${scope}`, threadId),
    onMutate: ({ threadId }) => {
      setNormalizedData({
        queryNormalizer,
        type: 'thread',
        id: threadId,
        update: { viewer_can_force_notification: false }
      })
    }
  })
}
