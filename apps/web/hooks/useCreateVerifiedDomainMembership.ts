import { useMutation, useQueryClient } from '@tanstack/react-query'

import { apiClient } from '@/utils/queryClient'

type CreateProps = {
  slug: string
}

export function useCreateVerifiedDomainMembership() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateProps) => apiClient.organizations.postVerifiedDomainMemberships().request(data.slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiClient.users.getMeSuggestedOrganizations().requestKey() })
      queryClient.invalidateQueries({ queryKey: apiClient.users.getMe().requestKey() })
      queryClient.invalidateQueries({
        queryKey: apiClient.organizationMemberships.getOrganizationMemberships().requestKey()
      })
    }
  })
}
