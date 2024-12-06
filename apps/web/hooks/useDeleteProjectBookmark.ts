import { useMutation, useQueryClient } from '@tanstack/react-query'

import { useScope } from '@/contexts/scope'
import { apiClient, setTypedQueriesData } from '@/utils/queryClient'

import { useGetProjectId } from './useGetProjectId'

export function useDeleteProjectBookmark(id: string) {
  const { scope } = useScope()
  const projectId = useGetProjectId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => apiClient.organizations.deleteProjectsBookmarksById().request(`${scope}`, projectId ?? '', id),
    onMutate() {
      if (!projectId) return
      setTypedQueriesData(
        queryClient,
        apiClient.organizations.getProjectsBookmarks().requestKey(`${scope}`, projectId),
        (old) => {
          if (!old) return
          return old.filter((b) => b.id !== id)
        }
      )
    }
  })
}
