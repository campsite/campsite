import { useQuery } from '@tanstack/react-query'

import { apiClient } from '@/utils/queryClient'

const query = apiClient.users.getMeSuggestedOrganizations()

export function useGetSuggestedOrganizations() {
  return useQuery({
    queryKey: query.requestKey(),
    queryFn: () => query.request()
  })
}
