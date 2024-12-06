import { useMutation } from '@tanstack/react-query'

import { useScope } from '@/contexts/scope'
import { apiClient } from '@/utils/queryClient'

export function useCreateStripeBillingPortalSession() {
  const { scope } = useScope()

  return useMutation({
    mutationFn: () => apiClient.organizations.postIntegrationsStripeBillingPortalSessions().request(`${scope}`)
  })
}
