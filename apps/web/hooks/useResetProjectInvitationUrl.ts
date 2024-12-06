import { useMutation, useQueryClient } from '@tanstack/react-query'

import { useScope } from '@/contexts/scope'
import { apiClient } from '@/utils/queryClient'

const getProjectsInvitationUrl = apiClient.organizations.getProjectsInvitationUrl()

export function useResetProjectInvitationUrl({ projectId }: { projectId: string }) {
  const { scope } = useScope()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => apiClient.organizations.postProjectsInvitationUrl().request(`${scope}`, projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getProjectsInvitationUrl.requestKey(`${scope}`, projectId) })
    }
  })
}
