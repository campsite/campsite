import { useMutation, useQueryClient } from '@tanstack/react-query'

import { useScope } from '@/contexts/scope'
import { apiErrorToast } from '@/utils/apiErrorToast'
import { useQueryNormalizer } from '@/utils/normy/QueryNormalizerProvider'
import { removeFavorite } from '@/utils/optimisticFavorites'
import { apiClient, setTypedQueriesData } from '@/utils/queryClient'
import { createNormalizedOptimisticUpdate } from '@/utils/queryNormalization'

const getThreads = apiClient.organizations.getThreads()

export function useDeleteThreadFavorite() {
  const { scope } = useScope()
  const queryClient = useQueryClient()
  const queryNormalizer = useQueryNormalizer()

  return useMutation({
    scope: { id: 'favorite' },
    mutationFn: (id: string) => apiClient.organizations.deleteThreadsFavorites().request(`${scope}`, id),
    onMutate(id) {
      removeFavorite({ queryClient, scope, resourceId: id })

      setTypedQueriesData(queryClient, getThreads.requestKey(`${scope}`), (old) => {
        if (!old) return old

        return {
          ...old,
          threads: old.threads.map((thread) =>
            thread.id === id ? { ...thread, viewer_has_favorited: false } : thread
          )
        }
      })

      return createNormalizedOptimisticUpdate({
        queryNormalizer,
        type: 'thread',
        id,
        update: { viewer_has_favorited: false }
      })
    },
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: getThreads.requestKey(`${scope}`) })
    },
    onError: apiErrorToast
  })
}
