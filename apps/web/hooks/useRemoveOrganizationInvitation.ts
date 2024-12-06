import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { useScope } from '@/contexts/scope'
import { apiErrorToast } from '@/utils/apiErrorToast'
import { apiClient } from '@/utils/queryClient'

type RemoveProps = {
  id: string
}

export function useRemoveOrganizationInvitation() {
  const { scope } = useScope()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: RemoveProps) => apiClient.organizations.deleteInvitationsById().request(`${scope}`, data.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiClient.organizations.getInvitations().baseKey })
      toast(`Invitation removed`)
    },
    onError: apiErrorToast
  })
}
