import { useQuery } from '@tanstack/react-query'

import { useScope } from '@/contexts/scope'
import { apiClient } from '@/utils/queryClient'

const getFavorites = apiClient.organizations.getFavorites()

export function useGetFavorites() {
  const { scope } = useScope()

  return useQuery({
    queryKey: getFavorites.requestKey(`${scope}`),
    queryFn: () => getFavorites.request(`${scope}`)
  })
}
