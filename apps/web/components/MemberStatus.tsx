import { useCallback, useEffect, useState } from 'react'
import { isTomorrow } from 'date-fns'
import { isMobile } from 'react-device-detect'

import { OrganizationMember } from '@campsite/types'
import { FaceSmilePlusIcon, Tooltip } from '@campsite/ui'
import { cn, ConditionalWrap } from '@campsite/ui/src/utils'

import { getExpiration } from '@/hooks/useCreateStatus'
import { useStatusIsExpired } from '@/hooks/useStatusIsExpired'
import { timestamp } from '@/utils/timestamp'

function getRelativeTime(time: number) {
  const parts: string[] = []

  const totalMinutes = Math.ceil(time / (1000 * 60))

  const days = Math.floor(totalMinutes / (60 * 24))
  const hours = Math.floor(totalMinutes / 60) - days * 24
  const minutes = totalMinutes % 60

  if (days > 0) {
    parts.push(`${days}d`)
  }
  if (days > 0 || hours > 0) {
    parts.push(`${hours}h`)
  }
  if (minutes > 0) {
    parts.push(`${minutes}m`)
  }

  return parts.join(' ')
}

export function getTimeRemaining(expiresAt?: string | null) {
  const currentTime = new Date().getTime()
  const todayRemaining = (getExpiration('today')?.getTime() ?? 0) - currentTime
  const timeRemaining = expiresAt ? new Date(expiresAt).getTime() - currentTime : -1

  if (timeRemaining < todayRemaining) {
    return getRelativeTime(timeRemaining)
  }

  if (timeRemaining === todayRemaining) {
    return 'today'
  }

  return getRelativeTime(timeRemaining)
}

export function getTimestamp(expiration: Date | null, relativity: 'absolute' | 'relative') {
  if (!expiration) return `Until the end of time`

  if (expiration.getTime() < (getExpiration('today')?.getTime() ?? 0)) {
    if (relativity === 'absolute') {
      return `until ${timestamp(expiration)}`
    } else {
      return `for ${getTimeRemaining(expiration.toISOString())}`
    }
  } else if (expiration.getTime() === getExpiration('today')?.getTime()) {
    return `until the end of day`
  } else if (expiration.getTime() === getExpiration('this_week')?.getTime()) {
    return `until the end of week`
  } else if (isTomorrow(expiration)) {
    return `until tomorrow at ${timestamp(expiration)}`
  } else {
    return `until ${expiration.toLocaleDateString(navigator.language || 'en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at ${timestamp(expiration)}`
  }
}

type Size = 'sm' | 'base' | 'lg' | 'xl'
interface StatusProps {
  status?: OrganizationMember['status']
  disabled?: boolean
  asTrigger?: boolean
  size?: Size
}

export function MemberStatus({ status, disabled, asTrigger, size = 'base' }: StatusProps) {
  const TEXT_SIZE: Record<Size, string> = {
    sm: 'text-xs leading-none',
    base: 'text-sm leading-none',
    lg: 'text-base leading-none',
    xl: 'text-lg leading-none'
  }

  const isExpired = useStatusIsExpired(status)

  if (isExpired || !status) {
    if (asTrigger) {
      return <FaceSmilePlusIcon size={isMobile ? 28 : 20} className={cn(isMobile && 'text-primary')} />
    } else {
      return null
    }
  }

  return (
    <ConditionalWrap
      condition={!disabled}
      wrap={(c) => (
        <Tooltip
          disableHoverableContent
          sideOffset={8}
          label={
            <span className='flex items-center gap-1.5'>
              <span>{status.emoji}</span>
              <span>
                {status.message}{' '}
                <span className='opacity-60'>
                  <MemberStatusTimeRemaining status={status} />
                </span>
              </span>
            </span>
          }
        >
          {c}
        </Tooltip>
      )}
    >
      <span className={cn('relative z-10 font-["emoji"]', TEXT_SIZE[size])}>{status.emoji}</span>
    </ConditionalWrap>
  )
}

export function MemberStatusTimeRemaining({ status }: { status?: OrganizationMember['status'] }) {
  const updateTimestamp = useCallback(() => {
    const phrase = getTimestamp(status?.expires_at ? new Date(status.expires_at) : null, 'relative')

    return phrase.charAt(0).toLocaleLowerCase() + phrase.slice(1)
  }, [status?.expires_at])

  const [timestamp, setTimestamp] = useState(updateTimestamp())

  useEffect(() => {
    setTimestamp(updateTimestamp())

    const interval = setInterval(() => {
      setTimestamp(updateTimestamp())
    }, 1000 * 60)

    return () => clearInterval(interval)
  }, [updateTimestamp])

  const isExpired = useStatusIsExpired(status)

  if (isExpired || !status) {
    return null
  }

  return <>{timestamp}</>
}
