import { useMutation, useQueryClient } from '@tanstack/react-query'

import { OrganizationCallFollowUpPostRequest } from '@campsite/types'

import { useScope } from '@/contexts/scope'
import { useQueryNormalizer } from '@/utils/normy/QueryNormalizerProvider'
import { clearNotificationsWithFollowUp, handleFollowUpInsert } from '@/utils/optimisticFollowUps'
import { apiClient } from '@/utils/queryClient'

const postCallsFollowUp = apiClient.organizations.postCallsFollowUp()
const getFollowUps = apiClient.organizations.getFollowUps()

export function useCreateCallFollowUp() {
  const { scope } = useScope()
  const queryClient = useQueryClient()
  const queryNormalizer = useQueryNormalizer()

  return useMutation({
    mutationFn: ({ callId, ...data }: { callId: string } & OrganizationCallFollowUpPostRequest) =>
      postCallsFollowUp.request(`${scope}`, callId, data),
    onMutate({ callId }) {
      clearNotificationsWithFollowUp({
        id: callId,
        type: 'call',
        queryClient
      })
    },
    onSuccess(newFollowUp) {
      handleFollowUpInsert({
        queryClient,
        queryNormalizer,
        followUp: newFollowUp
      })

      queryClient.invalidateQueries({ queryKey: getFollowUps.requestKey({ orgSlug: `${scope}` }) })
    }
  })
}
