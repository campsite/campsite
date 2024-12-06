import { InfiniteData } from '@tanstack/react-query'

import { MessagePage, OrganizationsOrgSlugThreadsThreadIdMessagesIdPutRequest } from '@campsite/types'

import { useScope } from '@/contexts/scope'
import { apiClient } from '@/utils/queryClient'

import { useOptimisticMutation } from './useOptimisticMutation'

interface UseEditMessageInput extends OrganizationsOrgSlugThreadsThreadIdMessagesIdPutRequest {
  threadId: string
  messageId: string
}

export function useEditMessage() {
  const { scope } = useScope()

  return useOptimisticMutation({
    mutationFn: ({ threadId, messageId, ...params }: UseEditMessageInput) =>
      apiClient.organizations.putThreadsMessagesById().request(`${scope}`, threadId, messageId, params),
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
              data: page.data.map((message) => {
                if (message.id === props.messageId) {
                  return {
                    ...message,
                    content: props.content
                  }
                } else if (message.reply?.id === props.messageId) {
                  return {
                    ...message,
                    reply: {
                      ...message.reply,
                      content: props.content
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
    ]
  })
}
