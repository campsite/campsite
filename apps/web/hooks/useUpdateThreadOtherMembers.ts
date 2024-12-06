import { useMutation, useQueryClient } from '@tanstack/react-query'

import { useScope } from '@/contexts/scope'
import { apiClient } from '@/utils/queryClient'

const getThreads = apiClient.organizations.getThreads()
const getThreadById = apiClient.organizations.getThreadsById()
const putThreadsOtherMembershipsList = apiClient.organizations.putThreadsOtherMembershipsList()

export function useUpdateThreadOtherMembers({ threadId }: { threadId: string }) {
  const { scope } = useScope()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (member_ids: string[]) => putThreadsOtherMembershipsList.request(`${scope}`, threadId, { member_ids }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getThreads.requestKey(`${scope}`) })
      queryClient.invalidateQueries({ queryKey: getThreadById.requestKey(`${scope}`, threadId) })
    }
  })
}
