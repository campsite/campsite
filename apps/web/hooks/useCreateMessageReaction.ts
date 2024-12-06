import { useMutation, useQueryClient } from '@tanstack/react-query'
import { addGroupedReaction, updateGroupedReaction } from 'helpers/groupedReactions'
import { v4 as uuid } from 'uuid'

import { SyncCustomReaction } from '@campsite/types'

import { usePusherSocketIdHeader } from '@/contexts/pusher'
import { useScope } from '@/contexts/scope'
import { apiClient, getTypedQueryData, setTypedInfiniteQueriesData } from '@/utils/queryClient'
import { getCustomReaction, getStandardReaction, StandardReaction } from '@/utils/reactions'
import { createPendingReaction, pendingReactionMutations } from '@/utils/reactions/mutations'

const postMessagesReactions = apiClient.organizations.postMessagesReactions()
const getMessages = apiClient.organizations.getThreadsMessages()

type Props = {
  threadId: string
  messageId: string
  reaction: StandardReaction | SyncCustomReaction
}

export function useCreateMessageReaction() {
  const { scope } = useScope()
  const queryClient = useQueryClient()
  const pusherSocketIdHeader = usePusherSocketIdHeader()

  return useMutation({
    scope: { id: 'reaction' },
    mutationFn: ({ messageId, reaction }: Props) =>
      postMessagesReactions.request(
        `${scope}`,
        messageId,
        { content: getStandardReaction(reaction)?.native, custom_content_id: getCustomReaction(reaction)?.id },
        { headers: pusherSocketIdHeader }
      ),
    onMutate: ({ messageId, threadId, reaction }) => {
      const currentUser = getTypedQueryData(queryClient, apiClient.users.getMe().requestKey())

      if (!currentUser) return
      const client_id = uuid()

      createPendingReaction(client_id)
      setTypedInfiniteQueriesData(queryClient, getMessages.requestKey({ orgSlug: `${scope}`, threadId }), (old) => {
        if (!old) return

        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            data: page.data.map((message) => {
              if (message.id !== messageId) return message

              return {
                ...message,
                grouped_reactions: addGroupedReaction({
                  viewer_reaction_id: client_id,
                  currentUser,
                  grouped_reactions: message.grouped_reactions,
                  reaction
                })
              }
            })
          }))
        }
      })

      return { client_id }
    },
    onSuccess(newReaction, { threadId, messageId }, { client_id }) {
      setTypedInfiniteQueriesData(queryClient, getMessages.requestKey({ orgSlug: `${scope}`, threadId }), (old) => {
        if (!old) return

        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            data: page.data.map((message) => {
              if (message.id !== messageId) return message

              return {
                ...message,
                grouped_reactions: updateGroupedReaction({
                  grouped_reactions: message.grouped_reactions,
                  id: client_id,
                  data: { viewer_reaction_id: newReaction.id }
                })
              }
            })
          }))
        }
      })

      pendingReactionMutations.get(client_id)?.resolve(newReaction.id)
    },
    onError(_, __, variables) {
      if (!variables) return
      pendingReactionMutations.get(variables.client_id)?.reject()
    }
  })
}
