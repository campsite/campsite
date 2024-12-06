import { useMutation, useQueryClient } from '@tanstack/react-query'

import { OrganizationsOrgSlugThreadsThreadIdMyMembershipPutRequest } from '@campsite/types'

import { useScope } from '@/contexts/scope'
import { apiClient, setTypedQueryData } from '@/utils/queryClient'

export function useUpdateThreadMembership({ threadId }: { threadId: string }) {
  const { scope } = useScope()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: OrganizationsOrgSlugThreadsThreadIdMyMembershipPutRequest) =>
      apiClient.organizations.putThreadsMyMembership().request(`${scope}`, threadId, data),
    onMutate: (data) => {
      setTypedQueryData(
        queryClient,
        apiClient.organizations.getThreadsMyMembership().requestKey(`${scope}`, threadId),
        (old) => {
          return !old ? old : { ...old, ...data }
        }
      )
    }
  })
}
