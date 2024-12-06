import { useCallback, useEffect, useState } from 'react'

import { OrganizationMember } from '@campsite/types/generated'

export function MemberLocalTime({ timezone }: { timezone?: OrganizationMember['user']['timezone'] }) {
  const getTime = useCallback(() => {
    return new Date().toLocaleTimeString('en-US', {
      timeZone: timezone || 'UTC',
      hour: 'numeric',
      minute: '2-digit'
    })
  }, [timezone])

  const [time, setTime] = useState(getTime())

  useEffect(() => {
    const updateTime = () => {
      setTime(getTime())
    }

    const setNextMinuteInterval = () => {
      const now = new Date()
      const delay = (60 - now.getSeconds()) * 1000 - now.getMilliseconds()

      // Set timeout for the first update
      const timeout = setTimeout(() => {
        updateTime()
        // Set interval for subsequent updates
        const interval = setInterval(updateTime, 60000)

        return () => clearInterval(interval)
      }, delay)

      return () => clearTimeout(timeout)
    }

    const cleanup = setNextMinuteInterval()

    return () => {
      cleanup()
    }
  }, [getTime])

  if (!timezone) return null

  return <>{time}</>
}
