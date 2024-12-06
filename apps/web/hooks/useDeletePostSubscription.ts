import { useMutation, useQueryClient } from '@tanstack/react-query'

import { useScope } from '@/contexts/scope'
import { apiErrorToast } from '@/utils/apiErrorToast'
import { useQueryNormalizer } from '@/utils/normy/QueryNormalizerProvider'
import { apiClient } from '@/utils/queryClient'
import { createNormalizedOptimisticUpdate } from '@/utils/queryNormalization'

export function useDeletePostSubscription() {
  const { scope } = useScope()
  const queryNormalizer = useQueryNormalizer()
  const queryClient = useQueryClient()

  return useMutation({
    scope: { id: 'post-subscription' },
    mutationFn: (postId: string) => apiClient.organizations.deletePostsUnsubscribe().request(`${scope}`, postId),
    onMutate: (postId) => {
      return createNormalizedOptimisticUpdate({
        queryNormalizer,
        type: 'post',
        id: postId,
        update: { viewer_has_subscribed: false }
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: apiClient.organizations.getMembersMeForMePosts().requestKey({ orgSlug: `${scope}` })
      })
    },
    onError: apiErrorToast
  })
}
