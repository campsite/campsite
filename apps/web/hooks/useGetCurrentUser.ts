import { useQuery } from '@tanstack/react-query'

import { apiClient } from '@/utils/queryClient'

const query = apiClient.users.getMe()

export function useGetCurrentUser() {
  return useQuery({
    queryKey: query.requestKey(),
    // send client TZ to the server so we can set the user's preferred timezone
    queryFn: () => query.request({ headers: { 'X-Campsite-Tz': Intl.DateTimeFormat().resolvedOptions().timeZone } }),
    staleTime: 1000 * 60,
    refetchOnWindowFocus: true
  })
}
