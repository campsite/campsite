import { useState } from 'react'
import { selectRoomID, useHMSStore } from '@100mslive/react-sdk'
import { useRouter } from 'next/router'

import { MessageThread } from '@campsite/types/generated'
import { Avatar } from '@campsite/ui/Avatar'
import { ChatBubbleIcon, VideoCameraFilledIcon } from '@campsite/ui/Icons'
import { cn } from '@campsite/ui/utils'

import { MemberAvatar } from '@/components/MemberAvatar'
import { useScope } from '@/contexts/scope'
import { useGetMessages } from '@/hooks/useGetMessages'
import { useMarkThreadRead } from '@/hooks/useMarkThreadRead'

import { MemberStatus } from '../MemberStatus'
import { ThreadHoverCard } from '../ThreadView/ThreadHoverCard'
import { SidebarLink } from './SidebarLink'

export function SidebarChatThread({
  thread,
  onRemove,
  removeTooltip,
  onPeek,
  isDragging
}: {
  thread: MessageThread
  onRemove?: () => void
  removeTooltip?: string
  onPeek?: (id?: string) => void
  isDragging?: boolean
  location: 'favorites' | 'chats'
}) {
  const router = useRouter()
  const { scope } = useScope()
  const firstMember = thread.other_members.at(0) || thread.deactivated_members.at(0)
  const active = thread.id === router.query.threadId && router.query.focus === 'true'
  const [prefetch, setPrefetch] = useState(false)
  const onCall = useHMSStore(selectRoomID) === thread?.remote_call_room_id
  const status = firstMember?.status
  const memberCount = thread.other_members.length + (thread.viewer_is_thread_member ? 1 : 0)
  const { mutate: markThreadRead } = useMarkThreadRead()

  useGetMessages({ threadId: thread.id, enabled: prefetch })

  if (!thread) return null

  const unread = thread.manually_marked_unread || (!active && thread.unread_count > 0)
  const href = { pathname: `/${scope}/chat/${thread.id}`, query: { focus: true } }

  const onClick = () => {
    if (isDragging) return

    markThreadRead({ threadId: thread.id })
  }

  return (
    <ThreadHoverCard
      thread={thread}
      disabled={isDragging}
      // prevent the sidebar chat thread from disappearing if the user has the favorites section collapsed and is peeking a thread
      onOpenChange={(open) => {
        onPeek?.(open ? thread.id : undefined)
      }}
    >
      <SidebarLink
        id={thread.id}
        key={thread.id}
        as={`/${scope}/chat/${thread.id}`}
        href={href}
        label={thread.title}
        onClick={onClick}
        labelAccessory={!thread.group && thread.other_members.length === 1 && <MemberStatus status={status} />}
        scroll={false}
        active={active}
        onMouseEnter={() => setPrefetch(true)}
        onMouseLeave={() => setPrefetch(false)}
        onRemove={onRemove}
        removeTooltip={removeTooltip}
        unread={unread}
        trailingAccessory={
          <>
            {thread.active_call && (
              <div
                className={cn('flex h-4 w-4 items-center justify-center rounded-md', {
                  'bg-green-500 text-white': onCall,
                  'bg-green-100 text-green-500 dark:bg-green-900/50': !onCall
                })}
              >
                <VideoCameraFilledIcon size={12} />
              </div>
            )}
          </>
        }
        leadingAccessory={
          thread.integration_dm ? (
            <Avatar urls={thread.avatar_urls} name={thread.title} size='xs' rounded='rounded-md' />
          ) : thread.group ? (
            thread.image_url ? (
              <Avatar urls={thread.avatar_urls} name={thread.title} size='xs' />
            ) : memberCount > 0 ? (
              <span className='bg-quaternary text-tertiary flex h-5 w-5 items-center justify-center rounded-md font-mono text-xs font-semibold'>
                {memberCount}
              </span>
            ) : (
              <ChatBubbleIcon />
            )
          ) : (
            firstMember && <MemberAvatar displayStatus member={firstMember} size='xs' />
          )
        }
      />
    </ThreadHoverCard>
  )
}
