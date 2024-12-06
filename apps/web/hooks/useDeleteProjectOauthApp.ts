import { useMutation, useQueryClient } from '@tanstack/react-query'

import { useScope } from '@/contexts/scope'
import { apiErrorToast } from '@/utils/apiErrorToast'
import { apiClient, setTypedQueriesData } from '@/utils/queryClient'

const indexQuery = apiClient.organizations.getProjectsOauthApplications()

export function useDeleteProjectOauthApp({ projectId }: { projectId: string }) {
  const { scope } = useScope()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      apiClient.organizations.deleteProjectsOauthApplicationsById().request(`${scope}`, projectId, id),
    onSuccess(_data, id) {
      setTypedQueriesData(queryClient, indexQuery.requestKey(`${scope}`, projectId), (old) => {
        return old?.filter((i) => i.id !== id)
      })
    },
    onError: apiErrorToast
  })
}
