import { MessageGroup } from './types'

function dateToGroupDay(date: Date) {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

export function insertTimestampsBetweenGroups(groups: MessageGroup[], hasNextPage: boolean = false) {
  const groupsWithTimestamps: (MessageGroup | { timestamp: Date } | { day: string })[] = []

  if (!hasNextPage && groups.length > 0) {
    const firstCreatedAt = groups.at(0)?.messages.at(0)?.created_at

    if (firstCreatedAt) groupsWithTimestamps.push({ timestamp: new Date(firstCreatedAt) })
  }

  const todayGroupDay = dateToGroupDay(new Date())
  const yesterdayGroupDay = dateToGroupDay(new Date(new Date().getTime() - MS_IN_DAY))

  groups.forEach((group, index) => {
    groupsWithTimestamps.push(group)

    if (index < groups.length - 1) {
      // insert day dividers
      const thisGroupDate = new Date(group.messages[0].created_at)
      const thisGroupDay = dateToGroupDay(thisGroupDate)
      const nextGroupDate = new Date(groups[groups.indexOf(group) + 1]?.messages[0]?.created_at)
      const nextGroupDay = dateToGroupDay(nextGroupDate)

      if (nextGroupDay !== thisGroupDay) {
        let dayLabel = ''

        if (todayGroupDay === nextGroupDay) {
          dayLabel = 'Today'
        } else if (yesterdayGroupDay === nextGroupDay) {
          dayLabel = 'Yesterday'
        } else {
          dayLabel = nextGroupDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
        }

        groupsWithTimestamps.push({ day: dayLabel })
      }

      // insert specific timestamp dividers
      const lastMessage = group.messages[group.messages.length - 1]
      const nextGroupFirstMessage = groups[index + 1].messages[0]

      const lastMessageDate = new Date(lastMessage.created_at)
      const nextGroupFirstMessageDate = new Date(nextGroupFirstMessage.created_at)

      if (nextGroupFirstMessageDate.getTime() - lastMessageDate.getTime() > groupTimestampGap) {
        groupsWithTimestamps.push({ timestamp: nextGroupFirstMessageDate })
      }
    }
  })

  return groupsWithTimestamps
}

const MS_IN_DAY = 86400000

export const groupTimestampGap = 60 * 30 * 1000
