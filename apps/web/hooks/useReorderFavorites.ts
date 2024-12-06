import { useMutation, useQueryClient } from '@tanstack/react-query'

import { Favorite } from '@campsite/types'

import { useScope } from '@/contexts/scope'
import { apiClient, setTypedQueryData } from '@/utils/queryClient'

function patchPosition(ids: string[], allFavorites: Favorite[]) {
  return allFavorites.map((f) => {
    const index = ids.indexOf(f.id)

    return index === -1 ? f : { ...f, position: index }
  })
}

export function useReorderFavorites() {
  const { scope } = useScope()
  const queryClient = useQueryClient()

  // optimistically update the cache without making an API call while dragging
  const onReorder = (ids: string[]) => {
    setTypedQueryData(queryClient, apiClient.organizations.getFavorites().requestKey(`${scope}`), (prev) => {
      return prev ? patchPosition(ids, prev) : prev
    })
  }

  const mutation = useMutation({
    mutationFn: (ids: string[]) =>
      apiClient.organizations.putFavoritesReorder().request(`${scope}`, {
        favorites: ids.map((id, position) => ({ id, position }))
      }),
    onMutate: async (ids) => {
      await queryClient.cancelQueries({ queryKey: apiClient.organizations.getFavorites().requestKey(`${scope}`) })

      onReorder(ids)
    }
  })

  return { onReorder, mutation }
}
