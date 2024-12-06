import { useEffect, useRef } from 'react'

import { useHasLatestBuild } from '@/hooks/useHasLatestBuild'
import { useIsOnline } from '@/hooks/useIsOnline'
import { useIsWindowFocused } from '@/hooks/useIsWindowFocused'

export function useBackgroundRefresh() {
  const isOnline = useIsOnline()
  const isFocused = useIsWindowFocused()
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const hasLatestBuild = useHasLatestBuild()

  useEffect(() => {
    const shouldRefresh = !hasLatestBuild && isOnline && !isFocused

    function handleRefresh() {
      if (shouldRefresh) window?.location.reload()
    }

    /*
      After the user blurs the desktop window, wait one hour and check
      if their app's client code is eligble for a refresh. We only refresh
      if the user is currently connected to the internet, the window is blurred,
      and the client code is stale.
    */
    if (isFocused) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    } else {
      timeoutRef.current = setTimeout(handleRefresh, 1000 * 60 * 60)
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [hasLatestBuild, isOnline, isFocused])
}
