import { useMutation, useQueryClient } from '@tanstack/react-query'

import { OrganizationsOrgSlugProjectsProjectIdOauthApplicationsPostRequest } from '@campsite/types'

import { useScope } from '@/contexts/scope'
import { apiErrorToast } from '@/utils/apiErrorToast'
import { apiClient } from '@/utils/queryClient'

export function useCreateProjectOauthApp({ projectId }: { projectId: string }) {
  const { scope } = useScope()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: OrganizationsOrgSlugProjectsProjectIdOauthApplicationsPostRequest) =>
      apiClient.organizations.postProjectsOauthApplications().request(`${scope}`, `${projectId}`, data),
    onSuccess: () => {
      if (!projectId) return
      queryClient.invalidateQueries({
        queryKey: apiClient.organizations.getProjectsOauthApplications().requestKey(`${scope}`, projectId)
      })
    },
    onError: apiErrorToast
  })
}
