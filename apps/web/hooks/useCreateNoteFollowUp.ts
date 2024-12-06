import { useMutation, useQueryClient } from '@tanstack/react-query'

import { OrganizationCommentFollowUpPostRequest } from '@campsite/types'

import { useScope } from '@/contexts/scope'
import { useQueryNormalizer } from '@/utils/normy/QueryNormalizerProvider'
import { clearNotificationsWithFollowUp, handleFollowUpInsert } from '@/utils/optimisticFollowUps'
import { apiClient } from '@/utils/queryClient'

const postNotesFollowUp = apiClient.organizations.postNotesFollowUp()
const getFollowUps = apiClient.organizations.getFollowUps()

export function useCreateNoteFollowUp() {
  const { scope } = useScope()
  const queryClient = useQueryClient()
  const queryNormalizer = useQueryNormalizer()

  return useMutation({
    mutationFn: ({ noteId, ...data }: { noteId: string } & OrganizationCommentFollowUpPostRequest) =>
      postNotesFollowUp.request(`${scope}`, noteId, data),
    onMutate({ noteId }) {
      clearNotificationsWithFollowUp({
        id: noteId,
        type: 'note',
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
