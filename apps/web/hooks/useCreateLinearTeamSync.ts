import { useMutation } from '@tanstack/react-query'

import { useScope } from '@/contexts/scope'
import { apiClient } from '@/utils/queryClient'

export function useCreateLinearTeamSync() {
  const { scope } = useScope()

  return useMutation({
    mutationFn: () => apiClient.organizations.postIntegrationsLinearTeamSyncs().request(`${scope}`)
  })
}
