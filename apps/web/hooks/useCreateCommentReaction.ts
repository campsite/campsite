import { useMutation, useQueryClient } from '@tanstack/react-query'
import { addGroupedReaction, updateGroupedReaction } from 'helpers/groupedReactions'
import { v4 as uuid } from 'uuid'

import { SyncCustomReaction } from '@campsite/types'

import { usePusherSocketIdHeader } from '@/contexts/pusher'
import { useScope } from '@/contexts/scope'
import { useQueryNormalizer } from '@/utils/normy/QueryNormalizerProvider'
import { apiClient, getTypedQueryData } from '@/utils/queryClient'
import { createNormalizedOptimisticUpdate, setNormalizedData } from '@/utils/queryNormalization'
import { getCustomReaction, getStandardReaction, StandardReaction } from '@/utils/reactions'
import { createPendingReaction, pendingReactionMutations } from '@/utils/reactions/mutations'

const postCommentsReactions = apiClient.organizations.postCommentsReactions()

type Props = {
  reaction: StandardReaction | SyncCustomReaction
}

export function useCreateCommentReaction(commentId: string) {
  const queryClient = useQueryClient()
  const queryNormalizer = useQueryNormalizer()
  const { scope } = useScope()
  const pusherSocketIdHeader = usePusherSocketIdHeader()

  return useMutation({
    scope: { id: 'reaction' },
    mutationFn: ({ reaction }: Props) =>
      postCommentsReactions.request(
        `${scope}`,
        commentId,
        { content: getStandardReaction(reaction)?.native, custom_content_id: getCustomReaction(reaction)?.id },
        { headers: pusherSocketIdHeader }
      ),
    onMutate: ({ reaction }) => {
      const currentUser = getTypedQueryData(queryClient, apiClient.users.getMe().requestKey())

      if (!currentUser) return
      const client_id = uuid()

      createPendingReaction(client_id)

      const optimisticUpdate = createNormalizedOptimisticUpdate({
        queryNormalizer,
        type: 'comment',
        id: commentId,
        update: (old) => ({
          ...old,
          grouped_reactions: addGroupedReaction({
            viewer_reaction_id: client_id,
            currentUser,
            grouped_reactions: old.grouped_reactions,
            reaction
          })
        })
      })

      return { ...optimisticUpdate, client_id }
    },
    onSuccess(newReaction, _, { client_id }) {
      setNormalizedData({
        queryNormalizer,
        type: 'comment',
        id: commentId,
        update: (old) => ({
          ...old,
          grouped_reactions: updateGroupedReaction({
            grouped_reactions: old.grouped_reactions,
            id: client_id,
            data: { viewer_reaction_id: newReaction.id }
          })
        })
      })

      pendingReactionMutations.get(client_id)?.resolve(newReaction.id)
    },
    onError(_, __, variables) {
      if (!variables) return
      pendingReactionMutations.get(variables.client_id)?.reject()
    }
  })
}
