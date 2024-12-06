import { useMutation, useQueryClient } from '@tanstack/react-query'

import { useScope } from '@/contexts/scope'
import { apiErrorToast } from '@/utils/apiErrorToast'
import { useQueryNormalizer } from '@/utils/normy/QueryNormalizerProvider'
import { removeFavorite } from '@/utils/optimisticFavorites'
import { apiClient } from '@/utils/queryClient'
import { createNormalizedOptimisticUpdate } from '@/utils/queryNormalization'

export function useDeleteThreadFavorite() {
  const { scope } = useScope()
  const queryClient = useQueryClient()
  const queryNormalizer = useQueryNormalizer()

  return useMutation({
    scope: { id: 'favorite' },
    mutationFn: (id: string) => apiClient.organizations.deleteThreadsFavorites().request(`${scope}`, id),
    onMutate(id) {
      removeFavorite({ queryClient, scope, resourceId: id })

      return createNormalizedOptimisticUpdate({
        queryNormalizer,
        type: 'thread',
        id,
        update: { viewer_has_favorited: false }
      })
    },
    onError: apiErrorToast
  })
}
