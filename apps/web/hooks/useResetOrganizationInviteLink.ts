import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { useScope } from '@/contexts/scope'
import { apiErrorToast } from '@/utils/apiErrorToast'
import { apiClient } from '@/utils/queryClient'

export function useResetOrganizationInviteToken() {
  const { scope } = useScope()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => apiClient.organizations.patchResetInviteToken().request(`${scope}`),
    onSuccess: () => {
      toast(`Invitation link has been reset.`)
      queryClient.invalidateQueries({ queryKey: apiClient.organizations.getInvitationUrl().requestKey(`${scope}`) })
    },
    onError: apiErrorToast
  })
}
