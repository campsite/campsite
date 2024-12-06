import { useMutation, useQueryClient } from '@tanstack/react-query'

import { UsersMeTwoFactorAuthenticationPutRequest } from '@campsite/types'

import { apiClient } from '@/utils/queryClient'

export function useUpdateTwoFactorAuthentication() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UsersMeTwoFactorAuthenticationPutRequest) =>
      apiClient.users.putMeTwoFactorAuthentication().request(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiClient.users.getMe().requestKey() })
    }
  })
}
