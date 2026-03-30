import { useMutation } from '@tanstack/react-query'

import { MessageThread } from '@campsite/types'
import { WEB_URL } from '@campsite/config'

import { useScope } from '@/contexts/scope'
import { apiClient } from '@/utils/queryClient'

const createCallRoom = apiClient.organizations.postCallRooms()
const postMessage = apiClient.organizations.postThreadsMessages()

export function useStartCallFromChat({ thread }: { thread?: MessageThread }) {
  const { scope } = useScope()

  return useMutation({
    mutationFn: async () => {
      if (!thread) return

      const callRoom = await createCallRoom.request(`${scope}`, {
        source: 'subject'
      })

      const joinUrl = `${WEB_URL}/${scope}/calls/join/${callRoom.id}`

      await postMessage.request(`${scope}`, thread.id, {
        content: `<p><a href="${joinUrl}">${joinUrl}</a></p>`,
        attachments: []
      })

      return callRoom
    }
  })
}
