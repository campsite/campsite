import { useMutation, useQueryClient } from '@tanstack/react-query'

import { Note } from '@campsite/types/generated'

import { useScope } from '@/contexts/scope'
import { apiErrorToast } from '@/utils/apiErrorToast'
import { useQueryNormalizer } from '@/utils/normy/QueryNormalizerProvider'
import { insertOptimisticFavorite, removeFavorite, replaceOptimisticFavorite } from '@/utils/optimisticFavorites'
import { apiClient } from '@/utils/queryClient'
import { createNormalizedOptimisticUpdate } from '@/utils/queryNormalization'

export function useCreateNoteFavorite() {
  const { scope } = useScope()
  const queryClient = useQueryClient()
  const queryNormalizer = useQueryNormalizer()

  return useMutation({
    scope: { id: 'favorite' },
    mutationFn: (note: Note) => apiClient.organizations.postNotesFavorite().request(`${scope}`, note.id),
    onMutate: (note) => {
      insertOptimisticFavorite({
        queryClient,
        scope,
        favoritableId: note.id,
        favoritableType: 'Note',
        name: note.title,
        url: `/${scope}/notes/${note.id}`
      })

      return createNormalizedOptimisticUpdate({
        queryNormalizer,
        type: 'note',
        id: note.id,
        update: { viewer_has_favorited: true }
      })
    },
    onSuccess: (data, note) => {
      replaceOptimisticFavorite({ queryClient, scope, favoritableId: note.id, data })
    },
    onError(error, note) {
      apiErrorToast(error)
      removeFavorite({ queryClient, scope, resourceId: note.id })
    }
  })
}
