import { useMemo } from 'react'
import pluralize from 'pluralize'

import { MessageThread } from '@campsite/types'
import { Button, LayeredHotkeys, UIText, VideoCameraIcon } from '@campsite/ui'
import { ConditionalWrap } from '@campsite/ui/src/utils'

import { AuthorLink } from '@/components/AuthorLink'
import { GuestBadge } from '@/components/GuestBadge'
import { MemberHovercard } from '@/components/InlinePost/MemberHovercard'
import { MemberLocalTime } from '@/components/MemberLocalTime'
import { MemberStatusTimeRemaining } from '@/components/MemberStatus'
import { ChatFavoriteButton } from '@/components/Thread/ChatFavoriteButton'
import { ChatThreadOverflowMenu } from '@/components/Thread/ChatThreadOverflowMenu'
import { ThreadAvatar } from '@/components/ThreadAvatar'
import { BreadcrumbLabel, BreadcrumbTitlebar } from '@/components/Titlebar/BreadcrumbTitlebar'
import { useGetThread } from '@/hooks/useGetThread'
import { useJoinMessageThreadCall } from '@/hooks/useJoinMessageThreadCall'

function ThreadBreadcrumbTitlebar({ thread }: { thread: MessageThread }) {
  const otherMembersTooltip = thread.other_members.map((m) => m.user.display_name).join(', ')
  const [otherMembersCount, otherGuestsCount] = useMemo(
    () =>
      thread?.other_members.reduce(
        ([membersCount, guestsCount], member) =>
          member.role === 'guest' ? [membersCount, guestsCount + 1] : [membersCount + 1, guestsCount],
        [0, 0]
      ) || [0, 0],
    [thread?.other_members]
  )

  const title = <BreadcrumbLabel title={otherMembersTooltip}>{thread.title}</BreadcrumbLabel>

  if (thread.group && thread.other_members.length > 3) {
    return (
      <div className='flex flex-col'>
        {title}
        <div className='flex items-center gap-2'>
          <UIText size='text-sm' tertiary title={otherMembersTooltip} className='leading-tight'>
            {/* add one to include current viewer */}
            {otherMembersCount + 1} {pluralize('member', otherMembersCount)}
            {otherGuestsCount > 0 && (
              <>
                {', '}
                {otherGuestsCount} {pluralize('guest', otherGuestsCount)}
              </>
            )}
          </UIText>
        </div>
      </div>
    )
  }

  if (!thread.group && thread.other_members.length === 1) {
    return (
      <div className='flex flex-col'>
        <div className='flex items-center gap-1.5'>
          {title}
          {thread.other_members.at(0)?.role === 'guest' && <GuestBadge />}
        </div>

        {thread.other_members[0]?.status && (
          <UIText tertiary className='flex items-center gap-1' size='text-xs'>
            {thread.other_members[0].status.emoji} {thread.other_members[0].status.message}{' '}
            <MemberStatusTimeRemaining status={thread.other_members[0].status} />
          </UIText>
        )}

        {thread.other_members[0]?.user.timezone && !thread.other_members[0]?.status && (
          <div className='flex items-center gap-1'>
            <UIText size='text-xs' tertiary>
              <MemberLocalTime timezone={thread.other_members[0]?.user.timezone} /> local time
            </UIText>
          </div>
        )}
      </div>
    )
  }

  return title
}

export function BreadcrumbCallButton({ thread }: { thread: MessageThread }) {
  const { joinCall, canJoin, onCall } = useJoinMessageThreadCall({ thread })

  if (!canJoin && !onCall) return null

  return (
    <>
      <LayeredHotkeys
        keys='mod+shift+h'
        callback={joinCall}
        options={{ preventDefault: true, enableOnContentEditable: true }}
      />

      <Button
        iconOnly={<VideoCameraIcon size={24} />}
        accessibilityLabel='Start call'
        variant='plain'
        tooltip={onCall ? 'Already joined call' : 'Start call'}
        tooltipShortcut='⌘+shift+H'
        onClick={joinCall}
        disabled={onCall}
      />
    </>
  )
}

export function ThreadViewTitlebar({
  threadId,
  placement,
  isFocus
}: {
  threadId: string
  placement?: 'hovercard' | undefined
  isFocus?: boolean
}) {
  const { data: thread } = useGetThread({ threadId })
  const firstParticipant = thread?.other_members.at(0) || thread?.deactivated_members.at(0)

  return (
    <BreadcrumbTitlebar hideSidebarToggle={!isFocus}>
      {thread && (
        <>
          <div className='flex flex-1 items-center gap-3'>
            <ConditionalWrap
              condition={!thread.group && !!firstParticipant}
              wrap={(children) => {
                if (!firstParticipant) return children

                return (
                  <MemberHovercard username={firstParticipant.user.username}>
                    <AuthorLink draggable={false} user={firstParticipant.user} className='flex items-center gap-3'>
                      {children}
                    </AuthorLink>
                  </MemberHovercard>
                )
              }}
            >
              <>
                <ThreadAvatar thread={thread} size='base' />
                <ThreadBreadcrumbTitlebar thread={thread} />
              </>
            </ConditionalWrap>

            <ChatFavoriteButton key={thread.id} thread={thread} shortcutEnabled={placement !== 'hovercard'} />
          </div>

          <div className='relative flex items-center gap-0.5'>
            <BreadcrumbCallButton thread={thread} />
            <ChatThreadOverflowMenu thread={thread} />
          </div>
        </>
      )}
    </BreadcrumbTitlebar>
  )
}
