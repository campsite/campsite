import { useMutation, useQueryClient } from '@tanstack/react-query'

import { OrganizationOnboardProjectsPostRequest } from '@campsite/types/generated'

import { useScope } from '@/contexts/scope'
import { apiClient } from '@/utils/queryClient'

const postOnboardProjects = apiClient.organizations.postOnboardProjects()

export function useCreateOnboardProjects() {
  const { scope } = useScope()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: OrganizationOnboardProjectsPostRequest) => postOnboardProjects.request(`${scope}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: apiClient.organizations.getProjectMemberships().requestKey(`${scope}`)
      })
      queryClient.invalidateQueries({ queryKey: apiClient.organizations.getSyncProjects().requestKey(`${scope}`) })
      queryClient.invalidateQueries({
        queryKey: apiClient.organizations.getProjects().requestKey({ orgSlug: `${scope}` })
      })
    }
  })
}
