import { groupTimestampGap } from './dateUtils'
import { Message, MessageGroup } from './types'

export function groupMessagesByUser(messages: Message[]) {
  const groups: MessageGroup[] = []

  messages.forEach((message) => {
    const lastGroup = groups[groups.length - 1]
    const lastMessage = lastGroup?.messages[lastGroup.messages.length - 1]

    if (lastMessage?.user.id === message.user.id) {
      const lastMessageDate = new Date(lastMessage.created_at)
      const currentMessageDate = new Date(message.created_at)

      if (currentMessageDate.getTime() - lastMessageDate.getTime() > groupTimestampGap) {
        groups.push({
          viewer_is_sender: message.viewer_is_sender,
          user: message.user,
          messages: [message]
        })
      } else {
        lastGroup.messages.push(message)
      }
    } else {
      groups.push({
        viewer_is_sender: message.viewer_is_sender,
        user: message.user,
        messages: [message]
      })
    }
  })

  return groups
}
