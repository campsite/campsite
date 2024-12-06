import { useMutation } from '@tanstack/react-query'

import { OrganizationIntegrationsStripeCheckoutSessionsPostRequest } from '@campsite/types'

import { useScope } from '@/contexts/scope'
import { apiClient } from '@/utils/queryClient'

export function useCreateStripeCheckoutSession() {
  const { scope } = useScope()

  return useMutation({
    mutationFn: (data: OrganizationIntegrationsStripeCheckoutSessionsPostRequest) =>
      apiClient.organizations.postIntegrationsStripeCheckoutSessions().request(`${scope}`, data)
  })
}
