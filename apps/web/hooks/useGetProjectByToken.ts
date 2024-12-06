import { useQuery } from '@tanstack/react-query'

import { apiClient } from '@/utils/queryClient'

const query = apiClient.publicProjects.getPublicProjectsByToken()

export function useGetProjectByToken(token: string) {
  return useQuery({
    queryKey: query.requestKey(token),
    queryFn: () => query.request(token)
  })
}
