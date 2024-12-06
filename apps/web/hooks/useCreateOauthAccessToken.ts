import { useMutation } from '@tanstack/react-query'

import { useScope } from '@/contexts/scope'
import { apiClient } from '@/utils/queryClient'

export function useCreateOauthAccessToken() {
  const { scope } = useScope()

  return useMutation({
    mutationFn: ({ oauthApplicationId }: { oauthApplicationId: string }) =>
      apiClient.organizations.postOauthApplicationsTokens().request(`${scope}`, oauthApplicationId)
  })
}
