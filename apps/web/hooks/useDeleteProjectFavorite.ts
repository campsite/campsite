import { useMutation, useQueryClient } from '@tanstack/react-query'

import { useScope } from '@/contexts/scope'
import { apiErrorToast } from '@/utils/apiErrorToast'
import { useQueryNormalizer } from '@/utils/normy/QueryNormalizerProvider'
import { removeFavorite } from '@/utils/optimisticFavorites'
import { apiClient } from '@/utils/queryClient'
import { createNormalizedOptimisticUpdate } from '@/utils/queryNormalization'

export function useDeleteProjectFavorite() {
  const { scope } = useScope()
  const queryClient = useQueryClient()
  const queryNormalizer = useQueryNormalizer()

  return useMutation({
    scope: { id: 'favorite' },
    mutationFn: (projectId: string) => apiClient.organizations.deleteProjectsFavorites().request(`${scope}`, projectId),
    onMutate(projectId: string) {
      return {
        ...removeFavorite({ queryClient, scope, resourceId: projectId }),
        ...createNormalizedOptimisticUpdate({
          queryNormalizer,
          type: 'project',
          id: projectId,
          update: { viewer_has_favorited: false }
        })
      }
    },
    onError(error, _, context) {
      apiErrorToast(error)

      if (context?.removeFavoriteRollbackData) {
        queryClient.setQueriesData(
          { queryKey: context.removeFavoriteRollbackData.queryKey },
          context?.removeFavoriteRollbackData.data
        )
      }
    }
  })
}
