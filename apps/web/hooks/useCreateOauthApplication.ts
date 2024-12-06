import { useMutation, useQueryClient } from '@tanstack/react-query'

import { OrganizationsOrgSlugOauthApplicationsPostRequest } from '@campsite/types/generated'

import { useScope } from '@/contexts/scope'
import { apiClient } from '@/utils/queryClient'

const getOauthApplications = apiClient.organizations.getOauthApplications()

export function useCreateOauthApplication() {
  const { scope } = useScope()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: OrganizationsOrgSlugOauthApplicationsPostRequest) =>
      apiClient.organizations.postOauthApplications().request(`${scope}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getOauthApplications.requestKey(`${scope}`) })
    }
  })
}
