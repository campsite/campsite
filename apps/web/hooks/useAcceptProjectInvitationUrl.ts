import { useMutation } from '@tanstack/react-query'

import { apiClient } from '@/utils/queryClient'

export function useAcceptProjectInvitationUrl() {
  return useMutation({
    mutationFn: ({ orgSlug, projectId, token }: { orgSlug: string; projectId: string; token: string }) =>
      apiClient.organizations.postProjectsInvitationUrlAcceptances().request(orgSlug, projectId, { token })
  })
}
