import { useMutation, useQueryClient } from '@tanstack/react-query'

import { OrganizationsPostRequest } from '@campsite/types'

import { useScope } from '@/contexts/scope'
import { apiClient } from '@/utils/queryClient'

export function useCreateOrganization() {
  const queryClient = useQueryClient()
  const { setScope } = useScope()

  return useMutation({
    mutationFn: (data: OrganizationsPostRequest) => apiClient.organizations.postOrganizations().request(data),
    onSuccess: (result) => {
      setScope(result.slug)
      queryClient.invalidateQueries({
        queryKey: apiClient.organizationMemberships.getOrganizationMemberships().requestKey()
      })
    }
  })
}
