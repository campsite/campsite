import { useEffect, useMemo, useRef } from 'react'
import { useAtomValue } from 'jotai'
import toast from 'react-hot-toast'

import { Message, MessageThread, OrganizationMember } from '@campsite/types'
import { Button, MoonFilledIcon, Tooltip, UIText } from '@campsite/ui'
import { cn } from '@campsite/ui/src/utils'

import { useCreateThreadNotificationForce } from '@/hooks/useCreateThreadNotificationForce'
import { dateToEpoch, MS_IN_DAY } from '@/utils/dateToEpoch'
import { longTimestamp, longTimestampFromDate } from '@/utils/timestamp'

import { editModeAtom } from '../Chat/atoms'
import { HTMLRenderer } from '../HTMLRenderer'
import { Bubble } from './Bubble'

// Takes a Date and returns a string in the format "MM/DD/YYYY"
function dateToGroupDay(date: Date) {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

interface MessageGroup {
  viewer_is_sender: boolean
  user: OrganizationMember['user']
  messages: Message[]
}

const groupTimestampGap = 60 * 30 * 1000

function groupMessagesByUser(messages: Message[]) {
  const groups: MessageGroup[] = []

  messages.forEach((message) => {
    if (message.call && message.discarded_at) return

    const lastGroup = groups[groups.length - 1]
    const lastMessage = lastGroup?.messages[lastGroup.messages.length - 1]

    if (lastMessage?.sender.user.id === message.sender.user.id) {
      const lastMessageDate = new Date(lastMessage.created_at)
      const currentMessageDate = new Date(message.created_at)

      if (currentMessageDate.getTime() - lastMessageDate.getTime() > groupTimestampGap) {
        groups.push({
          viewer_is_sender: message.viewer_is_sender,
          user: message.sender.user,
          messages: [message]
        })
      } else {
        lastGroup.messages.push(message)
      }
    } else {
      groups.push({
        viewer_is_sender: message.viewer_is_sender,
        user: message.sender.user,
        messages: [message]
      })
    }
  })

  return groups
}

function insertTimestampsBetweenGroups(groups: MessageGroup[], hasNextPage: boolean = false) {
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

interface Props {
  thread?: MessageThread
  messages: Message[]
  hasNextPage: boolean
  onNewMessage: (message: Message) => void
}

export function Messages({ thread, messages, hasNextPage, onNewMessage }: Props) {
  const lastMessageId = useRef<string | null>(null)
  const editMode = !!useAtomValue(editModeAtom)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!messages.length) return

    const localLast = messages[messages.length - 1]

    if (localLast?.id === lastMessageId.current) return
    if (lastMessageId.current) onNewMessage(localLast)

    lastMessageId.current = localLast?.id
  }, [onNewMessage, messages])

  const groupedMessages = useMemo(() => {
    return insertTimestampsBetweenGroups(groupMessagesByUser(messages), hasNextPage)
  }, [messages, hasNextPage])

  if (!thread) return null

  return (
    <div
      className={cn('relative flex flex-1 flex-col gap-3 px-3 pb-3 lg:px-4', {
        'pointer-events-none': editMode
      })}
      ref={ref}
    >
      {groupedMessages.map((group) => {
        if ('timestamp' in group) {
          return <TimestampHeader key={group.timestamp.getTime()} timestamp={group.timestamp} editMode={editMode} />
        } else if ('day' in group) {
          return <DayHeader key={group.day} day={group.day} />
        } else if (group.user.system) {
          return <SystemMessages key={group.messages[0].id} messages={group.messages} editMode={editMode} />
        } else if (group.viewer_is_sender) {
          return <ViewerMessages key={group.messages[0].id} messages={group.messages} thread={thread} />
        } else {
          return <OtherMessages key={group.messages[0].id} group={group} thread={thread} />
        }
      })}
      <DNDIndicator thread={thread} />
    </div>
  )
}

function DNDIndicator({ thread }: { thread: MessageThread }) {
  const isSingleMember = !thread.group && thread.other_members.length === 1
  const { mutate: forceNotification } = useCreateThreadNotificationForce()

  if (!isSingleMember) return null
  const otherMember = thread.other_members[0]

  if (!otherMember.user.notifications_paused) return

  return (
    <div className={cn('mx-auto flex flex-col items-center justify-center gap-1 px-8 text-center transition-opacity')}>
      <div className='flex items-center gap-1.5'>
        <MoonFilledIcon
          className={cn({
            'text-violet-500 dark:text-violet-400': !thread.viewer_can_force_notification,
            'text-tertiary': thread.viewer_can_force_notification
          })}
        />
        <span
          className={cn('break-anywhere text-xs [text-wrap:balance]', {
            'text-violet-500 dark:text-violet-400': !thread.viewer_can_force_notification,
            'text-tertiary': thread.viewer_can_force_notification
          })}
        >
          {otherMember.user.display_name} has notifications paused
        </span>
      </div>
      {thread.viewer_can_force_notification && (
        <Button
          variant='text'
          className='text-xs text-violet-500 dark:text-violet-400'
          onClick={() =>
            forceNotification(
              { threadId: thread.id },
              {
                onSuccess: () => {
                  toast(`Notified ${otherMember.user.display_name}`)
                }
              }
            )
          }
        >
          Notify anyway
        </Button>
      )}
    </div>
  )
}

function TimestampHeader({ timestamp, editMode }: { timestamp: Date; editMode: boolean }) {
  const timestampDateToEpoch = dateToEpoch(timestamp)

  const todayDateToEpoch = dateToEpoch(new Date())
  const groupIsWithinToday = timestampDateToEpoch === todayDateToEpoch

  return (
    <Tooltip label={longTimestampFromDate(timestamp)}>
      <div
        className={cn('my-2 flex items-center justify-center gap-1 transition-opacity', {
          'opacity-30': editMode
        })}
      >
        {!groupIsWithinToday && (
          <>
            <UIText size='text-xs' tertiary>
              {timestamp.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
              })}
            </UIText>
            <UIText size='text-xs' tertiary>
              ·
            </UIText>
          </>
        )}
        <UIText size='text-xs' tertiary>
          {timestamp.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: 'numeric'
          })}
        </UIText>
      </div>
    </Tooltip>
  )
}

function DayHeader({ day }: { day: string }) {
  return (
    <div className='bg-quaternary dark:bg-tertiary -mx-3 my-8 flex h-px items-center justify-center lg:-mx-4 lg:px-4'>
      <div className='bg-elevated sticky top-4 flex items-center justify-center rounded-full border border-gray-200 px-4 pb-[5px] pt-1.5 shadow-sm dark:border-0 dark:shadow-[inset_0px_1px_0px_rgba(255,255,255,0.04),_0px_2px_12px_rgba(0,0,0,0.4),_0px_0px_0px_1px_rgba(0,0,0,0.8)]'>
        <UIText size='text-[11px]' secondary className='uppercase' weight='font-bold'>
          {day}
        </UIText>
      </div>
    </div>
  )
}

function SystemMessages({ messages, editMode }: { messages: Message[]; editMode: boolean }) {
  return (
    <div
      className={cn('mx-auto flex flex-col items-center justify-center gap-4 px-8 text-center transition-opacity', {
        'opacity-30': editMode
      })}
    >
      {messages.map((message) => {
        return (
          <Tooltip disableHoverableContent key={message.created_at} label={longTimestamp(message.created_at)}>
            <HTMLRenderer
              as='span'
              text={message.content}
              // Despite Tailwind having a text-balance class, it conflicts with our text-{color} classes, so we need to use an arbitrary property for now
              className='text-tertiary break-anywhere text-xs [text-wrap:balance]'
            />
          </Tooltip>
        )
      })}
    </div>
  )
}

function ViewerMessages({ messages, thread }: { messages: Message[]; thread: MessageThread }) {
  return (
    <div className='m-0 flex w-full flex-col self-end p-0'>
      {messages.map((message) => {
        const position =
          messages.length === 1
            ? 'only'
            : message.id === messages[0].id
              ? 'first'
              : message.id === messages[messages.length - 1].id
                ? 'last'
                : 'middle'

        return <Bubble key={message.id} message={message} thread={thread} position={position} />
      })}
    </div>
  )
}

function OtherMessages({ group, thread }: { group: MessageGroup; thread: MessageThread }) {
  return (
    <div className='flex flex-col'>
      {thread && thread.other_members.length > 1 && (
        <div
          className={cn('ml-13.5 lg:ml-13', {
            'pb-0.5': !group.messages.at(0)?.reply
          })}
        >
          <UIText size='text-xs' tertiary>
            {group.user.display_name}
          </UIText>
        </div>
      )}
      <div className='m-0 flex w-full flex-col self-start p-0'>
        {group.messages.map((message) => {
          const position =
            group.messages.length === 1
              ? 'only'
              : message.id === group.messages[0].id
                ? 'first'
                : message.id === group.messages[group.messages.length - 1].id
                  ? 'last'
                  : 'middle'

          return <Bubble key={message.id} message={message} thread={thread} position={position} />
        })}
      </div>
    </div>
  )
}
