import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { useScope } from '@/contexts/scope'
import { apiErrorToast } from '@/utils/apiErrorToast'
import { apiClient } from '@/utils/queryClient'

export function useDisconnectSlack() {
  const { scope } = useScope()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => apiClient.organizations.deleteIntegrationsSlack().request(`${scope}`),
    onSuccess: () => {
      toast('Slack disconnected')
      queryClient.invalidateQueries({
        queryKey: apiClient.organizations.getIntegrationsSlack().requestKey(`${scope}`)
      })
    },
    onError: apiErrorToast
  })
}
