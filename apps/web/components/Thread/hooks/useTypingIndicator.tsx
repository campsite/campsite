import { useDebouncedCallback } from 'use-debounce'

import { useThreadChannel } from '@/hooks/useChatTypingIndicators'
import { useGetCurrentUser } from '@/hooks/useGetCurrentUser'

export function useTypingIndicator(channelName?: string) {
  const { data: currentUser } = useGetCurrentUser()
  const threadChannel = useThreadChannel(channelName)

  return useDebouncedCallback(
    () => {
      if (!threadChannel || !currentUser) return
      threadChannel.trigger('client-typing', { user: currentUser })
    },
    500,
    { leading: true, maxWait: 500 }
  )
}
