import { useMutation, useQueryClient } from '@tanstack/react-query'

import { OrganizationsOrgSlugCustomReactionsPacksPostRequest } from '@campsite/types'

import { useScope } from '@/contexts/scope'
import { apiClient, setTypedQueryData } from '@/utils/queryClient'

const getCustomReactionsPacks = apiClient.organizations.getCustomReactionsPacks()
const postCustomReactionsPacks = apiClient.organizations.postCustomReactionsPacks()
const getCustomReactions = apiClient.organizations.getCustomReactions()
const getSyncCustomReactions = apiClient.organizations.getSyncCustomReactions()

export function useCreateCustomReactionsPack() {
  const { scope } = useScope()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: OrganizationsOrgSlugCustomReactionsPacksPostRequest) => {
      await postCustomReactionsPacks.request(`${scope}`, data)
      // Invalidate custom reactions queries as part of the mutation to batch all async operations in one `isPending` state
      await queryClient.invalidateQueries({ queryKey: getCustomReactions.baseKey })
    },
    onSuccess: async (_, variables) => {
      queryClient.invalidateQueries({ queryKey: getSyncCustomReactions.requestKey(`${scope}`) })
      setTypedQueryData(queryClient, getCustomReactionsPacks.requestKey(`${scope}`), (old) => {
        if (!old) return old
        return old.map((pack) => ({ ...pack, installed: pack.name === variables.name ? true : pack.installed }))
      })
    }
  })
}
