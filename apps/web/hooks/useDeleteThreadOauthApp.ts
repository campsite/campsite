import { useMutation, useQueryClient } from '@tanstack/react-query'

import { useScope } from '@/contexts/scope'
import { apiErrorToast } from '@/utils/apiErrorToast'
import { apiClient, setTypedQueriesData } from '@/utils/queryClient'

const indexQuery = apiClient.organizations.getThreadsOauthApplications()

export function useDeleteThreadOauthApp({ threadId }: { threadId: string }) {
  const { scope } = useScope()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      apiClient.organizations.deleteThreadsOauthApplicationsById().request(`${scope}`, threadId, id),
    onSuccess(_data, id) {
      setTypedQueriesData(queryClient, indexQuery.requestKey(`${scope}`, threadId), (old) => {
        return old?.filter((i) => i.id !== id)
      })
    },
    onError: apiErrorToast
  })
}
