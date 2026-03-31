import { useMutation, useQueryClient } from '@tanstack/react-query'

import { MessageThread } from '@campsite/types'
import { WEB_URL } from '@campsite/config'

import { useScope } from '@/contexts/scope'
import { apiClient } from '@/utils/queryClient'

const createCallRoom = apiClient.organizations.postCallRooms()
const postMessage = apiClient.organizations.postThreadsMessages()
const getMessages = apiClient.organizations.getThreadsMessages()

export function useStartCallFromChat({ thread }: { thread?: MessageThread }) {
  const { scope } = useScope()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      if (!thread) return

      const callRoom = await createCallRoom.request(`${scope}`, {
        source: 'subject'
      })

      const joinUrl = `${WEB_URL}/${scope}/calls/join/${callRoom.id}`

      // Fire and forget — don't block on the message post
      postMessage.request(`${scope}`, thread.id, {
        content: `<p><a href="${joinUrl}">${joinUrl}</a></p>`,
        attachments: []
      }).then(() => {
        queryClient.invalidateQueries({
          queryKey: getMessages.requestKey({ orgSlug: `${scope}`, threadId: thread.id })
        })
      })

      return callRoom
    }
  })
}
