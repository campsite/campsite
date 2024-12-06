import { useMutation, useQueryClient } from '@tanstack/react-query'

import { useScope } from '@/contexts/scope'
import { apiClient, setTypedQueriesData } from '@/utils/queryClient'

const appQuery = apiClient.organizations.getOauthApplicationsById()

export function useRenewOauthSecret() {
  const queryClient = useQueryClient()
  const { scope } = useScope()

  return useMutation({
    mutationFn: ({ oauthApplicationId }: { oauthApplicationId: string }) =>
      apiClient.organizations.postOauthApplicationsSecretRenewals().request(`${scope}`, oauthApplicationId),
    onSuccess: (_, { oauthApplicationId }) => {
      setTypedQueriesData(queryClient, appQuery.requestKey(`${scope}`, oauthApplicationId), (old) => {
        if (!old) return

        return {
          ...old,
          last_copied_secret_at: new Date().toISOString()
        }
      })
    }
  })
}
