import { useMutation, useQueryClient } from '@tanstack/react-query'

import { OrganizationsOrgSlugThreadsIdPutRequest } from '@campsite/types'

import { useScope } from '@/contexts/scope'
import { useQueryNormalizer } from '@/utils/normy/QueryNormalizerProvider'
import { apiClient, setTypedQueryData } from '@/utils/queryClient'
import { createNormalizedOptimisticUpdate } from '@/utils/queryNormalization'

const putThreadsById = apiClient.organizations.putThreadsById()

export function useUpdateThread({ threadId }: { threadId: string }) {
  const { scope } = useScope()
  const queryClient = useQueryClient()
  const queryNormalizer = useQueryNormalizer()

  return useMutation({
    mutationFn: (data: OrganizationsOrgSlugThreadsIdPutRequest) => putThreadsById.request(`${scope}`, threadId, data),
    onMutate: (data) => {
      return createNormalizedOptimisticUpdate({
        queryNormalizer,
        type: 'thread',
        id: threadId,
        update: data
      })
    },
    onSuccess: (updatedThread) => {
      const getMembersByUsername = apiClient.organizations.getMembersByUsername()

      updatedThread.other_members.forEach((member) => {
        setTypedQueryData(queryClient, getMembersByUsername.requestKey(`${scope}`, member.user.username), member)
      })
    }
  })
}
