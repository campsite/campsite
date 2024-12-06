import { useMutation, useQueryClient } from '@tanstack/react-query'

import { useScope } from '@/contexts/scope'
import { apiErrorToast } from '@/utils/apiErrorToast'
import { useQueryNormalizer } from '@/utils/normy/QueryNormalizerProvider'
import { removeFavorite } from '@/utils/optimisticFavorites'
import { apiClient, setTypedQueriesData } from '@/utils/queryClient'
import { createNormalizedOptimisticUpdate } from '@/utils/queryNormalization'

export function useDeletePostFavorite() {
  const { scope } = useScope()
  const queryClient = useQueryClient()
  const queryNormalizer = useQueryNormalizer()

  return useMutation({
    scope: { id: 'favorite' },
    mutationFn: (postId: string) => apiClient.organizations.deletePostsFavorite().request(`${scope}`, postId),
    onMutate(postId) {
      return {
        ...removeFavorite({ queryClient, scope, resourceId: postId }),
        ...createNormalizedOptimisticUpdate({
          queryNormalizer,
          type: 'post',
          id: postId,
          update: { viewer_has_favorited: false }
        })
      }
    },
    onError(error, _, context) {
      apiErrorToast(error)

      if (context?.removeFavoriteRollbackData) {
        setTypedQueriesData(
          queryClient,
          context.removeFavoriteRollbackData.queryKey,
          context.removeFavoriteRollbackData.data
        )
      }
    }
  })
}
