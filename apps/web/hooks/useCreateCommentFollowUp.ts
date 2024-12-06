import { useMutation, useQueryClient } from '@tanstack/react-query'

import { OrganizationCommentFollowUpPostRequest } from '@campsite/types'

import { useScope } from '@/contexts/scope'
import { useQueryNormalizer } from '@/utils/normy/QueryNormalizerProvider'
import { clearNotificationsWithFollowUp, handleFollowUpInsert } from '@/utils/optimisticFollowUps'
import { apiClient } from '@/utils/queryClient'

const postCommentsFollowUp = apiClient.organizations.postCommentsFollowUp()
const getFollowUps = apiClient.organizations.getFollowUps()

export function useCreateCommentFollowUp() {
  const { scope } = useScope()
  const queryClient = useQueryClient()
  const queryNormalizer = useQueryNormalizer()

  return useMutation({
    mutationFn: ({ commentId, ...data }: { commentId: string } & OrganizationCommentFollowUpPostRequest) =>
      postCommentsFollowUp.request(`${scope}`, commentId, data),
    onMutate({ commentId }) {
      clearNotificationsWithFollowUp({
        id: commentId,
        type: 'comment',
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
