import { useMutation, useQueryClient } from '@tanstack/react-query'

import { Post } from '@campsite/types/generated'

import { useScope } from '@/contexts/scope'
import { apiErrorToast } from '@/utils/apiErrorToast'
import { useQueryNormalizer } from '@/utils/normy/QueryNormalizerProvider'
import { insertOptimisticFavorite, removeFavorite, replaceOptimisticFavorite } from '@/utils/optimisticFavorites'
import { apiClient } from '@/utils/queryClient'
import { createNormalizedOptimisticUpdate } from '@/utils/queryNormalization'

export function useCreatePostFavorite() {
  const { scope } = useScope()
  const queryClient = useQueryClient()
  const queryNormalizer = useQueryNormalizer()

  return useMutation({
    scope: { id: 'favorite' },
    mutationFn: (post: Post) => apiClient.organizations.postPostsFavorite().request(`${scope}`, post.id),
    onMutate: (post) => {
      insertOptimisticFavorite({
        queryClient,
        scope,
        favoritableId: post.id,
        favoritableType: 'Post',
        name: post.title || post.truncated_description_text,
        url: `/${scope}/posts/${post.id}`
      })

      return createNormalizedOptimisticUpdate({
        queryNormalizer,
        type: 'post',
        id: post.id,
        update: { viewer_has_favorited: true }
      })
    },
    onSuccess: (data, post) => {
      replaceOptimisticFavorite({ queryClient, scope, favoritableId: post.id, data })
    },
    onError(error, post) {
      apiErrorToast(error)
      removeFavorite({ queryClient, scope, resourceId: post.id })
    }
  })
}
