import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { useScope } from '@/contexts/scope'
import { apiErrorToast } from '@/utils/apiErrorToast'
import { apiClient } from '@/utils/queryClient'

type InviteMemberProps = {
  invitations: {
    email: string
    role: string
    project_ids?: string[]
  }[]
}

export function useInviteOrganizationMembers() {
  const { scope } = useScope()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: InviteMemberProps) => apiClient.organizations.postInvitations().request(`${scope}`, data),
    onSuccess: () => {
      toast('Invitations sent')
      queryClient.invalidateQueries({ queryKey: apiClient.organizations.getInvitations().baseKey })
    },
    onError: apiErrorToast
  })
}
