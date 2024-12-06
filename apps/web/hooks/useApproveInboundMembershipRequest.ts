import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { useScope } from '@/contexts/scope'
import { apiErrorToast } from '@/utils/apiErrorToast'
import { apiClient } from '@/utils/queryClient'

type ApproveProps = {
  id: string
}

export function useApproveInboundMembershipRequest() {
  const queryClient = useQueryClient()
  const { scope } = useScope()

  return useMutation({
    mutationFn: (data: ApproveProps) =>
      apiClient.organizations.postMembershipRequestsApprove().request(`${scope}`, data.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiClient.organizations.getMembershipRequests().baseKey })
      queryClient.invalidateQueries({ queryKey: apiClient.organizations.getMembers().baseKey })

      toast(`Membership request approved`)
    },
    onError: apiErrorToast
  })
}
