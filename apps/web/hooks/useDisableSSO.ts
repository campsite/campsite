import { useMutation } from '@tanstack/react-query'

import { useScope } from '@/contexts/scope'
import { apiClient } from '@/utils/queryClient'

export function useDisableSSO() {
  const { scope } = useScope()

  return useMutation({
    mutationFn: (_: null) => apiClient.organizations.deleteSso().request(`${scope}`)
  })
}
