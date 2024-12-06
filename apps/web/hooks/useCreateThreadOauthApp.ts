import { useMutation, useQueryClient } from '@tanstack/react-query'

import { OrganizationsOrgSlugThreadsThreadIdOauthApplicationsPostRequest } from '@campsite/types'

import { useScope } from '@/contexts/scope'
import { apiErrorToast } from '@/utils/apiErrorToast'
import { apiClient } from '@/utils/queryClient'

export function useCreateThreadOauthApp({ threadId }: { threadId: string }) {
  const { scope } = useScope()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: OrganizationsOrgSlugThreadsThreadIdOauthApplicationsPostRequest) =>
      apiClient.organizations.postThreadsOauthApplications().request(`${scope}`, `${threadId}`, data),
    onSuccess: () => {
      if (!threadId) return
      queryClient.invalidateQueries({
        queryKey: apiClient.organizations.getThreadsOauthApplications().requestKey(`${scope}`, threadId)
      })
    },
    onError: apiErrorToast
  })
}
