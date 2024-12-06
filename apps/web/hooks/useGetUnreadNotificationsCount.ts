import { useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { app } from '@todesktop/client-core'
import { useSetAtom } from 'jotai'
import { isMacOs, isWindows } from 'react-device-detect'

import { UserNotificationCounts } from '@campsite/types'
import { useIsDesktopApp } from '@campsite/ui/src/hooks'

import { setFaviconBadgeAtom } from '@/components/Providers/MetaTags'
import { apiClient } from '@/utils/queryClient'
import { safeSetAppBadge } from '@/utils/setAppBadge'

export function useUpdateBadgeCount() {
  const isDesktop = useIsDesktopApp()
  const setFaviconBadge = useSetAtom(setFaviconBadgeAtom)

  const fn = useCallback(
    (counts: UserNotificationCounts) => {
      const home = Object.values(counts.home_inbox).reduce((acc, orgCount) => acc + orgCount, 0)
      const threads = Object.values(counts.messages).reduce((acc, count) => acc + count, 0)
      const totalCount = home + threads

      if (isDesktop) {
        if (isMacOs) app.dock.setBadge(totalCount > 0 ? '•' : '')
        if (isWindows) app.setBadgeCount(totalCount)
      } else {
        setFaviconBadge(totalCount > 0)
        safeSetAppBadge(totalCount)
      }
    },
    [isDesktop, setFaviconBadge]
  )

  return fn
}

const query = apiClient.users.getMeNotificationsUnreadAllCount()

export function useGetUnreadNotificationsCount() {
  const updateBadgeCount = useUpdateBadgeCount()

  return useQuery({
    queryKey: query.requestKey(),
    queryFn: async () => {
      const result = await query.request()

      updateBadgeCount(result)
      return result
    },
    refetchInterval: 60 * 1000,
    refetchOnWindowFocus: true
  })
}
