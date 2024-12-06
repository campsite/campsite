import { useMutation } from '@tanstack/react-query'

import { apiClient } from '@/utils/queryClient'

type JoinProps = {
  token: string
  scope: string
}

export function useJoinOrganization() {
  return useMutation({
    mutationFn: (data: JoinProps) => apiClient.organizations.postJoinByToken().request(data.scope, data.token)
  })
}
