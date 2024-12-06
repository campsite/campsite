import { useMutation, useQueryClient } from '@tanstack/react-query'

import { useScope } from '@/contexts/scope'
import { useQueryNormalizer } from '@/utils/normy/QueryNormalizerProvider'
import { handleFollowUpDelete } from '@/utils/optimisticFollowUps'
import { apiClient } from '@/utils/queryClient'

const deleteFollowUpsById = apiClient.organizations.deleteFollowUpsById()
const getFollowUps = apiClient.organizations.getFollowUps()

export function useDeleteCallFollowUp() {
  const { scope } = useScope()
  const queryClient = useQueryClient()
  const queryNormalizer = useQueryNormalizer()

  return useMutation({
    mutationFn: ({ id }: { callId: string; id: string }) => deleteFollowUpsById.request(`${scope}`, id),
    onMutate({ callId, id }) {
      return handleFollowUpDelete({
        queryClient,
        queryNormalizer,
        followUpId: id,
        subjectId: callId,
        subjectType: 'Call'
      })
    },
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: getFollowUps.requestKey({ orgSlug: `${scope}` }) })
    }
  })
}
