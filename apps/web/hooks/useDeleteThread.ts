import { useMutation, useQueryClient } from '@tanstack/react-query'

import { useScope } from '@/contexts/scope'
import { apiErrorToast } from '@/utils/apiErrorToast'
import { apiClient } from '@/utils/queryClient'

const deleteThreadsById = apiClient.organizations.deleteThreadsById()
const getThreads = apiClient.organizations.getThreads()
const getFavorites = apiClient.organizations.getFavorites()
const getThreadsById = apiClient.organizations.getThreadsById()
const getMessages = apiClient.organizations.getThreadsMessages()

export function useDeleteThread() {
  const { scope } = useScope()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteThreadsById.request(`${scope}`, id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: getThreads.requestKey(`${scope}`) })
      queryClient.invalidateQueries({ queryKey: getFavorites.requestKey(`${scope}`) })
      queryClient.removeQueries({ queryKey: getThreadsById.requestKey(`${scope}`, id) })
      queryClient.removeQueries({ queryKey: getMessages.requestKey({ orgSlug: `${scope}`, threadId: id }) })
    },
    onError: apiErrorToast
  })
}
