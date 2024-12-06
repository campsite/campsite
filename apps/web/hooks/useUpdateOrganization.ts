import { useMutation, useQueryClient } from '@tanstack/react-query'

import { OrganizationsOrgSlugPutRequest } from '@campsite/types'

import { useScope } from '@/contexts/scope'
import { apiClient } from '@/utils/queryClient'

export function useUpdateOrganization() {
  const { scope } = useScope()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: OrganizationsOrgSlugPutRequest) =>
      apiClient.organizations.putByOrgSlug().request(`${scope}`, data),
    onSuccess: () => {
      // refreshes the org switcher in the navigation bar, like updating a changed avatar url
      queryClient.invalidateQueries({
        queryKey: apiClient.organizationMemberships.getOrganizationMemberships().requestKey()
      })
      queryClient.invalidateQueries({ queryKey: apiClient.organizations.getByOrgSlug().baseKey })
    }
  })
}
