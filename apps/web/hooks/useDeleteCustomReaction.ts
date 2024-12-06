import { useMutation, useQueryClient } from '@tanstack/react-query'

import { useScope } from '@/contexts/scope'
import { apiClient, setTypedInfiniteQueriesData } from '@/utils/queryClient'

const getCustomReactions = apiClient.organizations.getCustomReactions()
const deleteCustomReactionsById = apiClient.organizations.deleteCustomReactionsById()
const getSyncCustomReactions = apiClient.organizations.getSyncCustomReactions()

export function useDeleteCustomReaction() {
  const { scope } = useScope()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteCustomReactionsById.request(`${scope}`, id),
    onSuccess: async (_, id: string) => {
      queryClient.invalidateQueries({ queryKey: apiClient.organizations.getProjects().baseKey })
      queryClient.invalidateQueries({ queryKey: getSyncCustomReactions.requestKey(`${scope}`) })

      setTypedInfiniteQueriesData(queryClient, getCustomReactions.requestKey({ orgSlug: `${scope}` }), (old) => {
        if (!old) return

        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            data: page.data.filter((customReaction) => customReaction.id !== id)
          }))
        }
      })
    }
  })
}
