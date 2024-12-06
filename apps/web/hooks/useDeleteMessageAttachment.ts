import { InfiniteData } from '@tanstack/react-query'

import { MessagePage } from '@campsite/types'

import { useScope } from '@/contexts/scope'
import { apiClient } from '@/utils/queryClient'

import { useOptimisticMutation } from './useOptimisticMutation'

interface UseDeleteMessageAttachmentInput {
  threadId: string
  messageId: string
  attachmentId: string
}

export function useDeleteMessageAttachment() {
  const { scope } = useScope()

  return useOptimisticMutation({
    mutationFn: ({ attachmentId, messageId }: UseDeleteMessageAttachmentInput) =>
      apiClient.organizations.deleteMessagesAttachmentsById().request(`${scope}`, messageId, attachmentId),
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
              results: page.data.map((message) => {
                if (message.id === props.messageId) {
                  return {
                    ...message,
                    attachments: message.attachments.filter((attachment) => attachment.id !== props.attachmentId)
                  }
                } else if (message.reply?.id === props.messageId) {
                  return {
                    ...message,
                    reply: {
                      ...message.reply,
                      last_attachment:
                        message.reply.last_attachment?.id === props.attachmentId ? null : message.reply.last_attachment
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
