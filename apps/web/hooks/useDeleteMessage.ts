import { InfiniteData, useQueryClient } from '@tanstack/react-query'

import { MessagePage } from '@campsite/types'

import { useScope } from '@/contexts/scope'
import { apiClient } from '@/utils/queryClient'

import { useOptimisticMutation } from './useOptimisticMutation'

const DELETED_MESSAGE_CONTENT = '<p><em>This message has been deleted.</em></p>'

interface UseDeleteMessageInput {
  threadId: string
  messageId: string
}

const getThreadsById = apiClient.organizations.getThreadsById()

export function useDeleteMessage() {
  const { scope } = useScope()
  const queryClient = useQueryClient()

  return useOptimisticMutation({
    mutationFn: ({ threadId, messageId }: UseDeleteMessageInput) =>
      apiClient.organizations.deleteThreadsMessagesById().request(`${scope}`, threadId, messageId),
    optimisticFns: (props) => [
      {
        query: {
          queryKey: apiClient.organizations
            .getThreadsMessages()
            .requestKey({ orgSlug: `${scope}`, threadId: props.threadId }),
          exact: true
        },
        updater: (old: InfiniteData<MessagePage>): InfiniteData<MessagePage> => {
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data
                .filter((message) => message.id !== props.messageId)
                .map((message) => {
                  if (message.reply?.id === props.messageId) {
                    return {
                      ...message,
                      reply: {
                        ...message.reply,
                        content: DELETED_MESSAGE_CONTENT
                      }
                    }
                  } else {
                    return message
                  }
                })
            }))
          }
        }
      }
    ],
    onSuccess: (_, { threadId }) => {
      queryClient.invalidateQueries({ queryKey: getThreadsById.requestKey(`${scope}`, threadId) })
    }
  })
}
