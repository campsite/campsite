import { Message, MessageThread } from '@campsite/types'
import { cn } from '@campsite/ui/src/utils'

import { BubbleReactions } from './BubbleReactions'
import { SharedPost } from './SharedPost'

interface Props {
  message: Message
  thread: MessageThread
}

export function Engagements({ message, thread }: Props) {
  if (message.discarded_at) return null

  const hasReactionsOrSharedPost =
    (message.grouped_reactions && message.grouped_reactions.length > 0) || message.shared_post_url

  if (!hasReactionsOrSharedPost) return null

  return (
    <div
      className={cn(
        '-mb-0.5 flex -translate-y-1.5 flex-row',
        'z-10', // ensure reactions are above attachments only bubbles
        {
          'self-start': !message.viewer_is_sender,
          '-translate-x-1 self-end': message.viewer_is_sender
        }
      )}
    >
      {thread.group && <div className='w-11 flex-none' />}
      {message.shared_post_url && <SharedPost url={message.shared_post_url} />}
      <BubbleReactions message={message} thread={thread} />
    </div>
  )
}
