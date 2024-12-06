import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'

import { apiClient } from '@/utils/queryClient'

export function useAcceptOrganizationInvitation() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: ({ token }: { token: string }) =>
      apiClient.invitationsByToken.postInvitationsByTokenAccept().request(token),
    onSuccess: ({ redirect_path }) => {
      toast('Invitation accepted')

      router.push(redirect_path)
      queryClient.invalidateQueries({
        queryKey: apiClient.organizationMemberships.getOrganizationMemberships().requestKey()
      })
      queryClient.invalidateQueries({ queryKey: apiClient.users.getMeOrganizationInvitations().requestKey() })
    }
  })
}
