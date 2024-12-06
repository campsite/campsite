import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { apiErrorToast } from '@/utils/apiErrorToast'
import { apiClient, setTypedQueriesData } from '@/utils/queryClient'

interface CreateProps {
  slug: string
}

export function useCreateInboundMembershipRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateProps) => apiClient.organizations.postMembershipRequests().request(data.slug),
    onSuccess: ({ organization_slug }) => {
      queryClient.invalidateQueries({ queryKey: apiClient.users.getMeSuggestedOrganizations().requestKey() })
      setTypedQueriesData(queryClient, apiClient.organizations.getMembershipRequest().requestKey(organization_slug), {
        requested: true
      })
      toast(`Membership requested`)
    },
    onError: apiErrorToast
  })
}
