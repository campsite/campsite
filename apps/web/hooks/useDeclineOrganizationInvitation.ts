import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { apiErrorToast } from '@/utils/apiErrorToast'
import { apiClient } from '@/utils/queryClient'

type DeclineProps = {
  id: string
  slug: string
}

export function useDeclineOrganizationInvitation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: DeclineProps) => apiClient.organizations.deleteInvitationsById().request(data.slug, data.id),
    onSuccess: () => {
      toast('Invitation declined')
      queryClient.invalidateQueries({ queryKey: apiClient.users.getMeOrganizationInvitations().requestKey() })
    },
    onError: apiErrorToast
  })
}
