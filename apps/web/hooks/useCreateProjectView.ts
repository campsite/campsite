import { useMutation } from '@tanstack/react-query'

import { useScope } from '@/contexts/scope'
import { apiClient } from '@/utils/queryClient'

type Props = {
  projectId: string
}

export function useCreateProjectView() {
  const { scope } = useScope()

  return useMutation({
    mutationFn: ({ projectId }: Props) => apiClient.organizations.postProjectsViews().request(`${scope}`, projectId)
  })
}
