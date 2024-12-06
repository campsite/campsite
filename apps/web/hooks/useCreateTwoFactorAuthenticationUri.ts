import { useMutation } from '@tanstack/react-query'

import { apiClient } from '@/utils/queryClient'

export function useCreateTwoFactorAuthenticationUri() {
  return useMutation({
    mutationFn: (_: null) => apiClient.users.postMeTwoFactorAuthentication().request()
  })
}
