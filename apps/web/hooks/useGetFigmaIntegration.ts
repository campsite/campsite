import { useQuery } from '@tanstack/react-query'

import { apiClient } from '@/utils/queryClient'

const query = apiClient.integrations.getIntegrationsFigmaIntegration()

type Props = {
  enabled?: boolean
}

export function useGetFigmaIntegration(props?: Props) {
  const enabled = props?.enabled ?? true

  return useQuery({
    queryKey: query.requestKey(),
    queryFn: () => query.request(),
    enabled
  })
}
