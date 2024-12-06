import { useMutation, useQueryClient } from '@tanstack/react-query'

import { Favorite } from '@campsite/types'

import { useScope } from '@/contexts/scope'
import { apiErrorToast } from '@/utils/apiErrorToast'
import { useQueryNormalizer } from '@/utils/normy/QueryNormalizerProvider'
import { removeFavorite } from '@/utils/optimisticFavorites'
import { apiClient } from '@/utils/queryClient'
import { createNormalizedOptimisticUpdate } from '@/utils/queryNormalization'

export function useDeleteFavorite() {
  const { scope } = useScope()
  const queryClient = useQueryClient()
  const queryNormalizer = useQueryNormalizer()

  return useMutation({
    scope: { id: 'favorite' },
    mutationFn: (favorite: Favorite) => apiClient.organizations.deleteFavoritesById().request(`${scope}`, favorite.id),
    onMutate: async (favorite: Favorite) => {
      const removedFavorites = await removeFavorite({ queryClient, scope, resourceId: favorite.favoritable_id })

      switch (favorite.favoritable_type) {
        case 'Project':
          return {
            ...removedFavorites,
            ...createNormalizedOptimisticUpdate({
              queryNormalizer,
              type: 'project',
              id: favorite.favoritable_id,
              update: { viewer_has_favorited: false }
            })
          }
        case 'MessageThread':
          return {
            ...removedFavorites,
            ...createNormalizedOptimisticUpdate({
              queryNormalizer,
              type: 'thread',
              id: favorite.favoritable_id,
              update: { viewer_has_favorited: false }
            })
          }
        case 'Note':
          return {
            ...removedFavorites,
            ...createNormalizedOptimisticUpdate({
              queryNormalizer,
              type: 'note',
              id: favorite.favoritable_id,
              update: { viewer_has_favorited: false }
            })
          }
        case 'Post':
          return {
            ...removedFavorites,
            ...createNormalizedOptimisticUpdate({
              queryNormalizer,
              type: 'post',
              id: favorite.favoritable_id,
              update: { viewer_has_favorited: false }
            })
          }
        case 'Call':
          return {
            ...removedFavorites,
            ...createNormalizedOptimisticUpdate({
              queryNormalizer,
              type: 'call',
              id: favorite.favoritable_id,
              update: { viewer_has_favorited: false }
            })
          }
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
