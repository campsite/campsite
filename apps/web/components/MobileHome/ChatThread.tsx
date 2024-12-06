import { MessageThread } from '@campsite/types'
import { Avatar, ChatBubbleIcon } from '@campsite/ui'

import { MemberAvatar } from '@/components/MemberAvatar'
import { useScope } from '@/contexts/scope'

import { MemberStatus } from '../MemberStatus'
import { HomeNavigationItem } from './HomeNavigationItem'

export function ChatThread({ thread }: { thread: MessageThread }) {
  const { scope } = useScope()
  const firstMember = thread.other_members.at(0)
  const status = firstMember?.status
  const isDM = !thread.group && thread.other_members.length === 1

  return (
    <HomeNavigationItem
      unread={thread.manually_marked_unread || thread.unread_count > 0}
      href={`/${scope}/chat/${thread.id}`}
      icon={
        thread.group ? (
          thread.image_url ? (
            <Avatar urls={thread.avatar_urls} name={thread.title} size='sm' />
          ) : thread.other_members.length > 0 ? (
            <span className='bg-quaternary text-tertiary flex h-6 w-6 items-center justify-center rounded-md font-mono text-xs font-semibold'>
              {thread.other_members.length}
            </span>
          ) : (
            <ChatBubbleIcon size={24} />
          )
        ) : (
          firstMember && <MemberAvatar displayStatus member={firstMember} size='sm' />
        )
      }
      label={thread.title}
      labelAccessory={isDM && <MemberStatus size='lg' status={status} />}
    />
  )
}
