import { useMutation, useQueryClient } from '@tanstack/react-query'

import { OrganizationsOrgSlugCustomReactionsPostRequest } from '@campsite/types'

import { useScope } from '@/contexts/scope'
import { apiClient } from '@/utils/queryClient'

const getCustomReactions = apiClient.organizations.getCustomReactions()
const postCustomReactions = apiClient.organizations.postCustomReactions()
const getSyncCustomReactions = apiClient.organizations.getSyncCustomReactions()

export function useCreateCustomReaction() {
  const { scope } = useScope()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: OrganizationsOrgSlugCustomReactionsPostRequest) => postCustomReactions.request(`${scope}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getCustomReactions.requestKey({ orgSlug: `${scope}` }) })
      queryClient.invalidateQueries({ queryKey: getSyncCustomReactions.requestKey(`${scope}`) })
    }
  })
}
