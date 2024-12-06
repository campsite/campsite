import { User } from '@campsite/types'
import { Avatar, Tooltip } from '@campsite/ui'
import { cn } from '@campsite/ui/src/utils'

import { useScope } from '@/contexts/scope'
import { userListTooltipText } from '@/utils/userListTooltipText'

type UserWithWrapper = User & { wrapper?: (children: JSX.Element) => JSX.Element; isPresent?: boolean }

interface Props {
  users: UserWithWrapper[]
  link?: boolean
  limit?: number
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | 'xxl'
  totalUserCount?: number
  showTooltip?: boolean
  showIsPresent?: boolean
}

export function FacePile({
  limit = 3,
  users,
  size = 'base',
  link = false,
  totalUserCount,
  showTooltip = true,
  showIsPresent = false
}: Props) {
  const { scope } = useScope()

  // if the users count or total user count is one greater than the limit,
  // instead of showing a +1 overflow, we can include one extra user in the slice
  // and not show an overflow
  const shouldIncludeExtraUser = totalUserCount
    ? totalUserCount === limit + 1 && users.length > limit
    : users.length === limit + 1

  const visibleUsers = users.slice(0, shouldIncludeExtraUser ? limit + 1 : limit)

  const overflowCount = (totalUserCount || users.length) - limit - (shouldIncludeExtraUser ? 1 : 0)
  const showOverflow = overflowCount > 0

  const maxUsers = shouldIncludeExtraUser ? Math.min(users.length, limit + 1) : Math.min(users.length, limit)
  const tooltipText = userListTooltipText({ users: users.slice(limit, users.length), limit: 8 })

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
    <span className={cn('flex', containerLeftPadding)}>
      {visibleUsers.map((user, index) => {
        const shouldClip = showOverflow ? true : index >= 0 && index < maxUsers - 1
        const wrapper = user.wrapper || ((children) => children)

        return (
          <span key={user.logged_in ? user.id : user.display_name} className={cn('flex', overlapMargin)}>
            {wrapper(
              <Avatar
                size={size}
                name={user.display_name}
                urls={user.avatar_urls}
                href={link ? `/${scope}/people/${user.username}` : undefined}
                tooltip={showTooltip ? user.display_name : undefined}
                tooltipDelayDuration={0}
                clip={shouldClip ? 'facepile' : undefined}
                fade={showIsPresent && !user.isPresent}
              />
            )}
          </span>
        )
      })}

      {showOverflow && (
        <Tooltip delayDuration={0} label={tooltipText}>
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
        </Tooltip>
      )}
    </span>
  )
}
