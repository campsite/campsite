import { useMutation, useQueryClient } from '@tanstack/react-query'

import { OrganizationsOrgSlugProjectsProjectIdBookmarksIdPatchRequest } from '@campsite/types'

import { useScope } from '@/contexts/scope'
import { apiErrorToast } from '@/utils/apiErrorToast'
import { apiClient } from '@/utils/queryClient'

import { useGetProjectId } from './useGetProjectId'

export function useCreateProjectBookmark() {
  const { scope } = useScope()
  const projectId = useGetProjectId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: OrganizationsOrgSlugProjectsProjectIdBookmarksIdPatchRequest) =>
      apiClient.organizations.postProjectsBookmarks().request(`${scope}`, projectId ?? '', data),
    onSuccess: () => {
      if (!projectId) return
      queryClient.invalidateQueries({
        queryKey: apiClient.organizations.getProjectsBookmarks().requestKey(`${scope}`, projectId)
      })
    },
    onError: apiErrorToast
  })
}
