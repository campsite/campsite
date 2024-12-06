import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { useScope } from '@/contexts/scope'
import { apiErrorToast } from '@/utils/apiErrorToast'
import { apiClient } from '@/utils/queryClient'

type DeclineProps = {
  id: string
}

export function useDeclineInboundMembershipRequest() {
  const { scope } = useScope()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: DeclineProps) =>
      apiClient.organizations.postMembershipRequestsDecline().request(`${scope}`, data.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiClient.organizations.getMembershipRequests().baseKey })

      toast(`Membership request declined`)
    },
    onError: apiErrorToast
  })
}
