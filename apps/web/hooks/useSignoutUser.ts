import { useMutation } from '@tanstack/react-query'

import { useWebPush } from '@/contexts/WebPush'
import { safeSetAppBadge } from '@/utils/setAppBadge'

export function useSignoutUser() {
  const { unsubscribe } = useWebPush()

  return useMutation({
    mutationFn: async () => {
      try {
        await unsubscribe()
      } catch {
        // Keep logout moving even if push cleanup fails.
      }

      safeSetAppBadge(0)
      window.location.assign('/logout')
      return null
    }
  })
}
