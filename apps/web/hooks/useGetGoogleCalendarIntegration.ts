import { useQuery } from '@tanstack/react-query'

import { apiClient } from '@/utils/queryClient'

const query = apiClient.integrations.getIntegrationsGoogleCalendarIntegration()

export function useGetGoogleCalendarIntegration() {
  return useQuery({
    queryKey: query.requestKey(),
    queryFn: () => query.request()
  })
}
