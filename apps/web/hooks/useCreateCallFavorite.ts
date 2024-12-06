import { useMutation, useQueryClient } from '@tanstack/react-query'

import { Call } from '@campsite/types/generated'

import { useScope } from '@/contexts/scope'
import { apiErrorToast } from '@/utils/apiErrorToast'
import { useQueryNormalizer } from '@/utils/normy/QueryNormalizerProvider'
import { insertOptimisticFavorite, removeFavorite, replaceOptimisticFavorite } from '@/utils/optimisticFavorites'
import { apiClient } from '@/utils/queryClient'
import { createNormalizedOptimisticUpdate } from '@/utils/queryNormalization'

export function useCreateCallFavorite() {
  const { scope } = useScope()
  const queryClient = useQueryClient()
  const queryNormalizer = useQueryNormalizer()

  return useMutation({
    scope: { id: 'favorite' },
    mutationFn: (call: Call) => apiClient.organizations.postCallsFavorite().request(`${scope}`, call.id),
    onMutate: (call) => {
      insertOptimisticFavorite({
        queryClient,
        scope,
        favoritableId: call.id,
        favoritableType: 'Call',
        name: call.title ?? '',
        url: `/${scope}/calls/${call.id}`
      })

      return createNormalizedOptimisticUpdate({
        queryNormalizer,
        type: 'call',
        id: call.id,
        update: { viewer_has_favorited: true }
      })
    },
    onSuccess: (data, call) => {
      replaceOptimisticFavorite({ queryClient, scope, favoritableId: call.id, data })
    },
    onError(error, call) {
      apiErrorToast(error)
      removeFavorite({ queryClient, scope, resourceId: call.id })
    }
  })
}
