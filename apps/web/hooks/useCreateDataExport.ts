import { useMutation } from '@tanstack/react-query'

import { useScope } from '@/contexts/scope'
import { apiClient } from '@/utils/queryClient'

export function useCreateDataExport() {
  const { scope } = useScope()

  return useMutation({
    mutationFn: (_: null) => apiClient.organizations.postDataExports().request(`${scope}`)
  })
}
