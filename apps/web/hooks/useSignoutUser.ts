import { useMutation } from '@tanstack/react-query'

import { useWebPush } from '@/contexts/WebPush'
import { apiErrorToast } from '@/utils/apiErrorToast'
import { apiClient, signinUrl } from '@/utils/queryClient'
import { safeSetAppBadge } from '@/utils/setAppBadge'

export function useSignoutUser() {
  const { unsubscribe } = useWebPush()

  return useMutation({
    mutationFn: async () => {
      await unsubscribe()
      safeSetAppBadge(0)
      return apiClient.users.deleteMeSignOut().request()
    },
    onSuccess: () => {
      window.location.href = signinUrl()
    },
    onError: apiErrorToast
  })
}
