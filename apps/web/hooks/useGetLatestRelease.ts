import { useQuery } from '@tanstack/react-query'

import { fetcher } from '@/utils/queryClient'
import { Changelog } from '@/utils/types'

export function useGetChangelog({ enabled }: { enabled: boolean }) {
  return useQuery<Changelog[]>({
    queryKey: ['changelog-latest-release'],
    queryFn: () => fetcher('/api/latest-release'),
    staleTime: 1000 * 60 * 60 * 24, // 1 day,
    enabled
  })
}
