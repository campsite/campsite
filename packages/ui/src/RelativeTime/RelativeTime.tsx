import React, { useEffect, useState } from 'react'
import Timeago from 'react-timeago'

import { cn } from '..'

export function shortTimestamp(timestamp: string) {
  const currentYear = new Date().getFullYear()
  const timestampYear = new Date(timestamp).getFullYear()
  const includeYear = currentYear !== timestampYear

  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: includeYear ? 'numeric' : undefined
  })
}

function formatter(value: any, unit: any) {
  if (unit === 'second') {
    return 'Just now'
  } else {
    return value + unit.slice(0, 1)
  }
}

type RelativeTimeElement = React.ElementRef<'span'>
interface RelativeTimeProps extends React.HTMLAttributes<HTMLSpanElement> {
  time: string
  className?: string
}

export const RelativeTime = React.forwardRef<RelativeTimeElement, RelativeTimeProps>(
  ({ time, className, ...props }, ref) => {
    const [currentTime, setCurrentTime] = useState(Date.now())

    useEffect(() => {
      const interval = setInterval(() => {
        setCurrentTime(Date.now())
      }, 60000)

      return () => clearInterval(interval)
    }, [])

    const timeDiffInDays = Math.floor((currentTime - new Date(time).getTime()) / (1000 * 60 * 60 * 24))

    return (
      <span ref={ref} className={cn('whitespace-nowrap', className)} {...props}>
        {timeDiffInDays < 1 && <Timeago date={time} minPeriod={60} formatter={formatter} />}
        {timeDiffInDays >= 1 && shortTimestamp(time)}
      </span>
    )
  }
)
RelativeTime.displayName = 'RelativeTime'
