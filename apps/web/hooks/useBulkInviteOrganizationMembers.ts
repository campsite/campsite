import { useMutation, useQueryClient } from '@tanstack/react-query'

import { OrganizationBulkInvitesPostRequest } from '@campsite/types/generated'

import { useScope } from '@/contexts/scope'
import { apiClient } from '@/utils/queryClient'

export function useBulkInviteOrganizationMembers() {
  const { scope } = useScope()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: OrganizationBulkInvitesPostRequest) =>
      apiClient.organizations.postBulkInvites().request(`${scope}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiClient.organizations.getInvitations().baseKey })
    }
  })
}
