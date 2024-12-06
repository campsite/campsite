import { useMutation, useQueryClient } from '@tanstack/react-query'

import { useScope } from '@/contexts/scope'
import { apiClient, setTypedQueryData } from '@/utils/queryClient'

const getOrganizationMemberships = apiClient.organizationMemberships.getOrganizationMemberships()
const updateIndexViews = apiClient.organizations.putMembersMeIndexViews()

export function useMarkIndexPageRead() {
  const queryClient = useQueryClient()
  const { scope } = useScope()

  const newDate = new Date().toISOString()

  return useMutation({
    mutationFn: () =>
      updateIndexViews.request(`${scope}`, {
        last_viewed_posts_at: newDate
      }),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: getOrganizationMemberships.requestKey() })

      setTypedQueryData(queryClient, getOrganizationMemberships.requestKey(), (memberships) => {
        return memberships?.map((membership) => ({
          ...membership,
          last_viewed_posts_at: membership.organization.slug === scope ? newDate : membership.last_viewed_posts_at
        }))
      })
    }
  })
}
