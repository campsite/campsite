import { MessageThread } from '@campsite/types'
import { UIText } from '@campsite/ui'

import { useGetMessages } from '@/hooks/useGetMessages'

export function StartOfThread({ thread }: { thread?: MessageThread }) {
  const {
    isLoading: isMessagesLoading,
    hasNextPage: hasMessagesNextPage,
    isFetchingNextPage: isMessagesFetchingNextPage
  } = useGetMessages({ threadId: thread?.id })

  if (!thread) return null

  // Only show start of thread stuff when there are no more messages to load
  if (isMessagesFetchingNextPage || hasMessagesNextPage || isMessagesLoading) return null

  return (
    <div className='flex flex-col items-center justify-center gap-2 px-4 pt-8 text-center'>
      <UIText size='text-xs' className='break-anywhere' tertiary>
        Conversation started
      </UIText>
    </div>
  )
}
