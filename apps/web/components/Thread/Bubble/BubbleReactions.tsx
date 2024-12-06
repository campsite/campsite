import { Message, MessageThread, SyncCustomReaction } from '@campsite/types'
import { cn } from '@campsite/ui/src/utils'

import { Reactions } from '@/components/Reactions'
import { useCreateMessageReaction } from '@/hooks/useCreateMessageReaction'
import { useDeleteReaction } from '@/hooks/useDeleteReaction'
import { findGroupedReaction, StandardReaction } from '@/utils/reactions'

interface Props {
  message: Message
  thread: MessageThread
}

function getClasses(hasReacted: boolean) {
  return cn(
    'flex justify-center pointer-events-auto items-center',
    'pl-1.5 pr-[7px] h-5.5 text-[11px] gap-[5px]',
    'group rounded-full font-medium ring-1 min-w-[32px]',
    {
      'bg-blue-100/70 dark:bg-blue-900/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-900 dark:text-blue-400':
        hasReacted,
      'bg-tertiary hover:bg-quaternary': !hasReacted
    }
  )
}

export function BubbleReactions({ message, thread }: Props) {
  const createReaction = useCreateMessageReaction()
  const deleteReaction = useDeleteReaction()

  if (message.discarded_at) return null
  if (!message.grouped_reactions || message.grouped_reactions.length === 0) return null

  function handleCreateReaction(reaction: StandardReaction | SyncCustomReaction) {
    createReaction.mutate({ reaction, threadId: thread.id, messageId: message.id })
  }

  function handleDeleteReaction(id: string) {
    deleteReaction.mutate({ id, type: 'message', threadId: thread.id, messageId: message.id })
  }

  function handleReactionSelect(reaction: StandardReaction | SyncCustomReaction) {
    const groupedReaction = findGroupedReaction(message.grouped_reactions, reaction)

    if (groupedReaction?.viewer_reaction_id) {
      handleDeleteReaction(groupedReaction.viewer_reaction_id)
    } else {
      handleCreateReaction(reaction)
    }
  }

  return (
    <div
      className={cn(
        'ring-primary h-5.5 bg-primary flex flex-wrap items-center gap-0.5 rounded-full px-px shadow-sm ring-2',
        {
          'flex-row-reverse': message.viewer_is_sender
        }
      )}
    >
      <Reactions
        reactions={message.grouped_reactions}
        onReactionSelect={handleReactionSelect}
        getClasses={getClasses}
      />
    </div>
  )
}
