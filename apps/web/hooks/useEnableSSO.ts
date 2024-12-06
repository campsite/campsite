import { useMutation } from '@tanstack/react-query'

import { OrganizationSsoPostRequest } from '@campsite/types'

import { useScope } from '@/contexts/scope'
import { apiClient } from '@/utils/queryClient'

export function useEnableSSO() {
  const { scope } = useScope()

  return useMutation({
    mutationFn: (data: OrganizationSsoPostRequest) => apiClient.organizations.postSso().request(`${scope}`, data)
  })
}
