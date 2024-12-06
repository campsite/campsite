import { useMutation, useQueryClient } from '@tanstack/react-query'

import { OrganizationsOrgSlugProjectsProjectIdBookmarksIdPatchRequest } from '@campsite/types'

import { useScope } from '@/contexts/scope'
import { apiClient, setTypedQueriesData } from '@/utils/queryClient'

import { useGetProjectId } from './useGetProjectId'

export function useUpdateProjectBookmark(id: string) {
  const { scope } = useScope()
  const projectId = useGetProjectId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: OrganizationsOrgSlugProjectsProjectIdBookmarksIdPatchRequest) =>
      apiClient.organizations.patchProjectsBookmarksById().request(`${scope}`, projectId ?? '', id, data),
    onMutate(data) {
      if (!projectId) return
      setTypedQueriesData(
        queryClient,
        apiClient.organizations.getProjectsBookmarks().requestKey(`${scope}`, projectId),
        (old) => {
          if (!old) return
          return old.map((b) => {
            if (b.id === id) {
              return {
                ...b,
                title: data.title,
                url: data.url
              }
            }
            return b
          })
        }
      )
    }
  })
}
