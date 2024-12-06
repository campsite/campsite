import { useQuery } from '@tanstack/react-query'

import { useScope } from '@/contexts/scope'
import { apiClient } from '@/utils/queryClient'

const query = apiClient.organizations.getOauthApplicationsById()

export function useGetOauthApplication(oauthApplicationId: string) {
  const { scope } = useScope()

  return useQuery({
    queryKey: query.requestKey(`${scope}`, oauthApplicationId),
    queryFn: () => query.request(`${scope}`, oauthApplicationId)
  })
}
