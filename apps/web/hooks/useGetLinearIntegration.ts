import { useQuery } from '@tanstack/react-query'

import { ApiError, LinearIntegration } from '@campsite/types'

import { useScope } from '@/contexts/scope'
import { apiClient } from '@/utils/queryClient'

type Props = {
  enabled?: boolean
}

const query = apiClient.organizations.getIntegrationsLinearInstallation()

export function useGetLinearIntegration(props?: Props) {
  const { scope } = useScope()

  return useQuery<LinearIntegration, ApiError>({
    queryKey: query.requestKey(`${scope}`),
    queryFn: () => query.request(`${scope}`),
    enabled: props?.enabled ?? true
  })
}
