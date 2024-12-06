import { useQuery } from '@tanstack/react-query'

import { apiClient } from '@/utils/queryClient'

const query = apiClient.openGraphLinks.getOpenGraphLinks()

export function useGetOpenGraphLink(url: string) {
  return useQuery({
    queryKey: query.requestKey({ url }),
    queryFn: async () => query.request({ url }),
    gcTime: Infinity,
    staleTime: 1000 * 60 * 60 * 24 // 1 day
  })
}
