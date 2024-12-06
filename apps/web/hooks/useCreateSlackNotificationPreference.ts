import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { apiErrorToast } from '@/utils/apiErrorToast'
import { apiClient, setTypedQueriesData } from '@/utils/queryClient'

export function useCreateSlackNotificationPreference(scope: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => apiClient.organizations.postMembersMeSlackNotificationPreference().request(`${scope}`),
    onSuccess: () => {
      setTypedQueriesData(
        queryClient,
        apiClient.organizations.getMembersMeSlackNotificationPreference().requestKey(`${scope}`),
        { enabled: true }
      )
      toast('Slack notifications enabled')
    },
    onError: apiErrorToast
  })
}
