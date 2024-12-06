import { useMemo, useState } from 'react'
import pluralize from 'pluralize'
import Timeago from 'react-timeago'

import { OrganizationMember, Post } from '@campsite/types'
import {
  CONTAINER_STYLES,
  GlobeIcon,
  Link,
  Popover,
  PopoverContent,
  PopoverPortal,
  PopoverTrigger,
  shortTimestamp,
  UIText
} from '@campsite/ui'
import { cn } from '@campsite/ui/src/utils'

import { GuestBadge } from '@/components/GuestBadge'
import { MemberAvatar } from '@/components/MemberAvatar'
import { useScope } from '@/contexts/scope'
import { useGetCurrentUser } from '@/hooks/useGetCurrentUser'
import { useGetPostViews } from '@/hooks/useGetPostViews'
import { flattenInfiniteData } from '@/utils/flattenInfiniteData'

import { FollowUps } from '../FollowUp'
import { InfiniteLoader } from '../InfiniteLoader'

interface Props {
  post: Post
  children: React.ReactNode
  display?: 'all' | 'viewers' | 'follow-ups'
  side?: 'top' | 'left' | 'right' | 'bottom'
  align?: 'start' | 'center' | 'end'
  modal?: boolean
}

export function PostViewersPopover({
  post,
  children,
  side = 'bottom',
  align = 'end',
  modal = false,
  display = 'all'
}: Props) {
  const [open, setOpen] = useState(false)
  const { data: currentUser } = useGetCurrentUser()

  if (!currentUser?.logged_in) {
    return children
  }

  return (
    <Popover open={open} onOpenChange={setOpen} modal={modal}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverPortal>
        <PopoverContent
          side={side}
          align={align}
          sideOffset={8}
          onCloseAutoFocus={(event) => event.preventDefault()}
          className={cn(
            'w-[320px]',
            CONTAINER_STYLES.base,
            CONTAINER_STYLES.shadows,
            'bg-elevated rounded-lg dark:border dark:bg-clip-border'
          )}
        >
          <div className='scrollbar-hide flex max-h-[400px] flex-col gap-0.5 overflow-y-scroll'>
            {(display === 'all' || display === 'follow-ups') && (
              <FollowUps followUps={post.follow_ups} showBorder={display !== 'follow-ups'} />
            )}
            {(display === 'all' || display === 'viewers') && <Views post={post} />}
          </div>
        </PopoverContent>
      </PopoverPortal>
    </Popover>
  )
}

function Views({ post }: { post: Post }) {
  const {
    data: viewsData,
    hasNextPage,
    isError,
    isLoading,
    isFetching,
    isFetchingNextPage,
    fetchNextPage
  } = useGetPostViews({ postId: post.id })

  const views = useMemo(() => flattenInfiniteData(viewsData), [viewsData])
  const { non_member_views_count } = post

  const nonMemberViewersDescriptor =
    non_member_views_count > 0
      ? `${non_member_views_count} anonymous ${pluralize('view', non_member_views_count)}`
      : null

  if (isLoading) return null
  if (!post.views_count && !post.non_member_views_count) return null

  return (
    <div className='p-1.5'>
      <div className='p-2'>
        <UIText size='text-xs' weight='font-medium' tertiary>
          Seen by
        </UIText>
      </div>

      {post.non_member_views_count > 0 && (
        <div className='flex items-center gap-2 px-2 py-1.5'>
          <div className='flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 text-blue-400 dark:bg-blue-900/50'>
            <GlobeIcon />
          </div>
          <UIText>{nonMemberViewersDescriptor}</UIText>
        </div>
      )}

      {views?.map((view) => <ViewLink key={view.id} member={view.member} time={view.updated_at} />)}

      <InfiniteLoader
        hasNextPage={!!hasNextPage}
        isError={!!isError}
        isFetching={!!isFetching}
        isFetchingNextPage={!!isFetchingNextPage}
        fetchNextPage={fetchNextPage}
      />
    </div>
  )
}

export function ViewLink({ member, time }: { member: OrganizationMember; time?: string }) {
  const { scope } = useScope()

  return (
    <Link href={`/${scope}/people/${member.user.username}`}>
      <div className='hover:bg-tertiary flex items-center gap-2 rounded-md px-2 py-1.5'>
        <MemberAvatar member={member} size='base' />
        <div className='flex flex-col'>
          <span className='flex items-center gap-1'>
            <UIText className='line-clamp-1' weight='font-medium'>
              {member.user.display_name}
            </UIText>
            {member.role === 'guest' && <GuestBadge />}
          </span>

          {time && (
            <UIText size='text-xs' quaternary>
              Last viewed <RelativeTimeAgo time={time} />
            </UIText>
          )}
        </div>
      </div>
    </Link>
  )
}

function formatter(value: any, unit: any) {
  if (unit === 'second') {
    return 'now'
  } else {
    return value + unit.slice(0, 1) + ' ago'
  }
}

function RelativeTimeAgo({ time }: { time: string }) {
  const timeDiffInDays = Math.floor((Date.now() - new Date(time).getTime()) / (1000 * 60 * 60 * 24))

  return (
    <span className='whitespace-nowrap'>
      {timeDiffInDays < 1 && <Timeago date={time} minPeriod={60} formatter={formatter} />}
      {timeDiffInDays >= 1 && shortTimestamp(time)}
    </span>
  )
}
