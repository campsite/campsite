import { useEffect, useState } from 'react'

import { OrganizationMembershipStatus } from '@campsite/types'

export function useStatusIsExpired(status?: OrganizationMembershipStatus | null) {
  const getIsExpired = (expiresAt?: string | null) =>
    expiresAt ? new Date(expiresAt).getTime() < new Date().getTime() : false

  const [isExpired, setIsExpired] = useState(getIsExpired(status?.expires_at))

  useEffect(() => {
    setIsExpired(getIsExpired(status?.expires_at))

    const interval = setInterval(() => {
      setIsExpired(getIsExpired(status?.expires_at))
    }, 1000 * 60)

    return () => clearInterval(interval)
  }, [status?.expires_at])

  return isExpired
}
