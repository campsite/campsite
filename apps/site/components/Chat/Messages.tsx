import { useMemo } from 'react'

import { cn } from '@campsite/ui'

import { insertTimestampsBetweenGroups } from './dateUtils'
import { groupMessagesByUser } from './groupMessagesByUser'
import { OtherMessages } from './OtherMessages'
import { Message, MessageThread } from './types'
import { ViewerMessages } from './ViewerMessages'

export function Messages({ thread, messages }: { thread: MessageThread; messages: Message[] }) {
  const groupedMessages = useMemo(() => {
    return insertTimestampsBetweenGroups(groupMessagesByUser(messages), false)
  }, [messages])

  if (!thread) return null

  return (
    <div className={cn('relative flex flex-1 flex-col gap-3 p-3', {})}>
      {groupedMessages.map((group) => {
        if ('timestamp' in group || 'day' in group || group.user.system) {
          return null
        } else if (group.viewer_is_sender) {
          return <ViewerMessages key={group.messages[0].id} thread={thread} messages={group.messages} />
        } else {
          return <OtherMessages key={group.messages[0].id} group={group} thread={thread} />
        }
      })}
    </div>
  )
}
