import { useMutation, useQueryClient } from '@tanstack/react-query'

import { Project } from '@campsite/types/generated'

import { useScope } from '@/contexts/scope'
import { apiErrorToast } from '@/utils/apiErrorToast'
import { useQueryNormalizer } from '@/utils/normy/QueryNormalizerProvider'
import { insertOptimisticFavorite, removeFavorite, replaceOptimisticFavorite } from '@/utils/optimisticFavorites'
import { apiClient } from '@/utils/queryClient'
import { createNormalizedOptimisticUpdate } from '@/utils/queryNormalization'

export function useCreateProjectFavorite() {
  const { scope } = useScope()
  const queryClient = useQueryClient()
  const queryNormalizer = useQueryNormalizer()

  return useMutation({
    scope: { id: 'favorite' },
    mutationFn: (project: Project) => apiClient.organizations.postProjectsFavorites().request(`${scope}`, project.id),
    onMutate: (project) => {
      insertOptimisticFavorite({
        queryClient,
        scope,
        favoritableId: project.id,
        favoritableType: 'Project',
        name: project.name,
        project,
        url: `/${scope}/projects/${project.id}`
      })

      return createNormalizedOptimisticUpdate({
        queryNormalizer,
        type: 'project',
        id: project.id,
        update: { viewer_has_favorited: true }
      })
    },
    onSuccess: (data, project) => {
      replaceOptimisticFavorite({ queryClient, scope, favoritableId: project.id, data })
    },
    onError(error, project) {
      apiErrorToast(error)
      removeFavorite({ queryClient, scope, resourceId: project.id })
    }
  })
}
