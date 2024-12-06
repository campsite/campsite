import { useMemo } from 'react'

import { MessageThread, OrganizationMember } from '@campsite/types'
import { Avatar, ChatBubbleIcon, cn } from '@campsite/ui'

import { MemberAvatar } from '@/components/MemberAvatar'

type Size = 'base' | 'lg'

interface Props {
  thread: MessageThread
  size?: Size
}

export function ThreadAvatar({ thread, size = 'lg' }: Props) {
  // members don't return in a static order, so this prevents reordering on renders
  const members = useMemo(() => thread.other_members, [thread.other_members])

  if (thread.image_url) {
    return <Avatar urls={thread.avatar_urls} size={size} rounded={thread.integration_dm ? 'rounded' : undefined} />
  }

  // DM with deactivated user; use their avatar
  if (!thread.other_members.length && thread.deactivated_members.length === 1) {
    return <MultiUserAvatar members={thread.deactivated_members} size={size} />
  }

  if (!members || members.length === 0) return <Fallback size={size} />
  if (thread.group && members.length === 1) return <Fallback size={size} />

  // Now we are dealing with non-groups, or groups with >1 other person
  return <MultiUserAvatar members={members} size={size} />
}

function Fallback({ size }: { size: Size }) {
  const SIZE = {
    base: 'h-8 w-8',
    lg: 'h-10 w-10'
  }[size]

  return (
    <div className={cn('flex items-center justify-center rounded-full bg-black/5 dark:bg-white/10', SIZE)}>
      <ChatBubbleIcon strokeWidth='2' className='text-quaternary' />
    </div>
  )
}

export function MultiUserAvatar({
  members,
  size = 'lg',
  showOnlineIndicator = true
}: {
  members: OrganizationMember[]
  size?: Size
  showOnlineIndicator?: boolean
}) {
  // server doesn't return members in a consistent order, this is a client side hack for now
  const orderedMembers = useMemo(
    () => members.sort((a, b) => a.user.display_name.localeCompare(b.user.display_name)),
    [members]
  )

  if (members.length === 1) {
    return <SingleMemberAvatar member={orderedMembers[0]} size={size} showOnlineIndicator={showOnlineIndicator} />
  }

  if (members.length === 2) {
    return <DoubleMemberAvatar members={orderedMembers} />
  }

  return <ManyMemberAvatar members={orderedMembers} />
}

function SingleMemberAvatar({
  member,
  size = 'lg',
  showOnlineIndicator
}: {
  member: OrganizationMember
  size: Size
  showOnlineIndicator?: boolean
}) {
  return <MemberAvatar member={member} size={size} displayStatus={showOnlineIndicator} />
}

function DoubleMemberAvatar({ members }: { members: OrganizationMember[] }) {
  const [first, second] = members

  return (
    <div className='bg-quaternary relative h-10 w-10 rounded-full'>
      <div className='absolute -left-[5px] -top-[5px] z-[1] scale-[0.48] rounded-full'>
        <Avatar
          deactivated={first.deactivated}
          name={first.user.display_name}
          urls={first.user.avatar_urls}
          size='lg'
        />
      </div>
      <div className='absolute -bottom-[8px] -right-[8px] z-[2] scale-[0.34] rounded-full'>
        <Avatar
          deactivated={second.deactivated}
          name={second.user.display_name}
          urls={second.user.avatar_urls}
          size='lg'
        />
      </div>
    </div>
  )
}

function ManyMemberAvatar({ members }: { members: OrganizationMember[] }) {
  const [first, second, third] = members

  return (
    <div className='bg-quaternary relative h-10 w-10 rounded-full'>
      <div className='absolute -left-[5px] -top-[5px] z-[2] scale-[0.49] rounded-full'>
        <Avatar
          deactivated={first.deactivated}
          name={first.user.display_name}
          urls={first.user.avatar_urls}
          size='lg'
        />
      </div>
      <div className='absolute -right-[11px] bottom-0 z-[3] scale-[0.3] rounded-full'>
        <Avatar
          deactivated={second.deactivated}
          name={second.user.display_name}
          urls={second.user.avatar_urls}
          size='lg'
        />
      </div>
      <div className='absolute -bottom-[11px] -right-px z-[2] scale-[0.28] rounded-full'>
        <Avatar
          deactivated={third.deactivated}
          name={third.user.display_name}
          urls={third.user.avatar_urls}
          size='lg'
        />
      </div>
    </div>
  )
}
