import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { apiErrorToast } from '@/utils/apiErrorToast'
import { apiClient, setTypedQueriesData } from '@/utils/queryClient'

export function useDeleteSlackNotificationPreference(scope: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => apiClient.organizations.deleteMembersMeSlackNotificationPreference().request(`${scope}`),
    onSuccess: () => {
      setTypedQueriesData(
        queryClient,
        apiClient.organizations.getMembersMeSlackNotificationPreference().requestKey(`${scope}`),
        { enabled: false }
      )
      toast('Slack notifications disabled')
    },
    onError: apiErrorToast
  })
}
