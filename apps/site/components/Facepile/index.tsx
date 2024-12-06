import Link from 'next/link'

import { Avatar } from '@campsite/ui'
import { cn, ConditionalWrap } from '@campsite/ui/src/utils'

export interface FacepileUser {
  src: string
  name: string
  url?: string
}

interface Props {
  users: FacepileUser[]
  limit?: number
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | 'xxl'
  totalUserCount?: number
  showTooltip?: boolean
}

export function FacePile({ limit = 3, users, size = 'base', totalUserCount, showTooltip = true }: Props) {
  // if the users count or total user count is one greater than the limit,
  // instead of showing a +1 overflow, we can include one extra user in the slice
  // and not show an overflow
  const shouldIncludeExtraUser = totalUserCount ? totalUserCount === limit + 1 : users.length === limit + 1

  const visibleUsers = users.slice(0, shouldIncludeExtraUser ? limit + 1 : limit)

  const overflowCount = (totalUserCount || users.length) - limit - (shouldIncludeExtraUser ? 1 : 0)
  const showOverflow = overflowCount > 0
  const maxUsers = shouldIncludeExtraUser ? Math.min(users.length, limit + 1) : Math.min(users.length, limit)

  const overflowTextSize = {
    xs: 'text-[10px]',
    sm: 'text-[11px]',
    base: 'text-[13px]',
    lg: 'text-[15px]',
    xl: 'text-[23px]',
    xxl: 'text-[30px]'
  }[size]

  const overflowMinWidth = {
    xs: 'min-w-[20px]',
    sm: 'min-w-[24px]',
    base: 'min-w-[32px]',
    lg: 'min-w-[40px]',
    xl: 'min-w-[64px]',
    xxl: 'min-w-[112px]'
  }[size]

  const overflowPadding = {
    xs: 'px-1',
    sm: 'px-1.5',
    base: 'px-2',
    lg: 'px-2.5',
    xl: 'px-3',
    xxl: 'px-3.5'
  }[size]

  const overlapMargin = {
    xs: '-ml-px',
    sm: '-ml-0.5',
    base: '-ml-1',
    lg: '-ml-[9px]',
    xl: '-ml-2.5',
    xxl: '-ml-3.5'
  }[size]

  const containerLeftPadding = {
    xs: 'pl-px',
    sm: 'pl-0.5',
    base: 'pl-1',
    lg: 'pl-[9px]',
    xl: 'pl-2.5',
    xxl: 'pl-3.5'
  }[size]

  return (
    <div className={cn('flex', containerLeftPadding)}>
      {visibleUsers.map((user, index) => {
        const shouldClip = showOverflow ? true : index >= 0 && index < maxUsers - 1

        return (
          <ConditionalWrap
            key={user.src}
            condition={!!user.url}
            wrap={(children) => (
              <Link draggable={false} href={user.url as string} target='_blank' className='focus:ring-0'>
                {children}
              </Link>
            )}
          >
            <div className={cn(overlapMargin)}>
              <Avatar
                size={size}
                name={user.name}
                src={user.src}
                tooltipDelayDuration={0}
                tooltip={showTooltip ? user.name : undefined}
                clip={shouldClip ? 'facepile' : undefined}
              />
            </div>
          </ConditionalWrap>
        )
      })}

      {showOverflow && (
        <div
          className={cn(
            'flex flex-none items-center justify-center rounded-full bg-black text-white dark:bg-neutral-700',
            overflowMinWidth,
            overflowPadding,
            overlapMargin
          )}
        >
          <span className={cn('-ml-[5%] font-mono font-semibold tracking-tighter', overflowTextSize)}>
            <span className='inline-block -translate-y-[0.5px]'>+</span>
            {overflowCount}
          </span>
        </div>
      )}
    </div>
  )
}
