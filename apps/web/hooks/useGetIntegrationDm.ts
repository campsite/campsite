import { useQuery } from '@tanstack/react-query'

import { useScope } from '@/contexts/scope'
import { apiClient } from '@/utils/queryClient'

const getThreadsIntegrationDmByOauthApplicationId =
  apiClient.organizations.getThreadsIntegrationDmsByOauthApplicationId()

export function useGetIntegrationDm({ oauthApplicationId }: { oauthApplicationId: string }) {
  const { scope } = useScope()

  return useQuery({
    queryKey: getThreadsIntegrationDmByOauthApplicationId.requestKey(`${scope}`, oauthApplicationId),
    queryFn: () => getThreadsIntegrationDmByOauthApplicationId.request(`${scope}`, oauthApplicationId),
    enabled: !!scope
  })
}
