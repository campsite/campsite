import { useQuery } from '@tanstack/react-query'

import { apiClient } from '@/utils/queryClient'

const query = apiClient.organizationByToken.getOrganizationByToken()

export function useGetOrganizationByToken(token: string) {
  return useQuery({
    queryKey: query.requestKey(token),
    queryFn: () => query.request(token)
  })
}
