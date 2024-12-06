import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import * as Sentry from '@sentry/nextjs'

import { RAILS_API_URL, WEB_PUSH_PUBLIC_KEY } from '@campsite/config'

import { useIsPWA } from '@/hooks/useIsPWA'
import { apiClient } from '@/utils/queryClient'

interface ContextProps {
  subscribe: () => Promise<void>
  unsubscribe: () => Promise<void>
  permission: NotificationPermission
}

const WebPushContext = createContext<ContextProps>({
  subscribe: () => Promise.resolve(),
  unsubscribe: () => Promise.resolve(),
  permission: 'default'
})

interface Props {
  children: React.ReactNode
}

// @ts-ignore
const conv = (val) => btoa(String.fromCharCode.apply(null, new Uint8Array(val)))

export const WebPushProvider: React.FC<Props> = ({ children }) => {
  const [permission, setPermission] = useState(() => ('Notification' in window ? Notification.permission : 'denied'))
  const [pushManager, setPushManager] = useState<PushManager | null>(null)
  const canPush = useIsPWA()

  useEffect(() => {
    if (canPush && 'permissions' in navigator && 'query' in navigator.permissions) {
      navigator.permissions
        .query({ name: 'notifications' })
        .then((status) => {
          status.onchange = () => {
            setPermission(status.state === 'prompt' ? 'default' : status.state)
          }
        })
        .catch(() => setPermission('denied'))
    }
  }, [canPush])

  useEffect(() => {
    if (!canPush || !pushManager) return

    const run = async () => {
      const existingSubscription = await pushManager.getSubscription()

      if (permission === 'granted') {
        // already registered a subscription
        if (existingSubscription) return

        const subscription = await pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: WEB_PUSH_PUBLIC_KEY
        })
        const p256dh = conv(subscription.getKey('p256dh'))
        const auth = conv(subscription.getKey('auth'))

        await apiClient.pushSubscriptions.postPushSubscriptions().request({
          new_endpoint: subscription.endpoint,
          p256dh,
          auth
        })
      } else if (permission === 'denied' && existingSubscription) {
        await existingSubscription.unsubscribe()
      }
    }

    run()
  }, [permission, pushManager, canPush])

  useEffect(() => {
    if (canPush && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register(`/service_worker.js?API_URL=${RAILS_API_URL}`).then(
        (registration) => {
          if ('pushManager' in registration) {
            setPushManager(registration.pushManager)
          }
        },
        (error) => {
          Sentry.captureException(`Service Worker registration failed: ${error}`)
        }
      )
    }
  }, [canPush])

  const value = useMemo(() => {
    return {
      subscribe: async () => {
        const permissions = await Notification.requestPermission()

        setPermission(permissions)
      },
      unsubscribe: async () => {
        if (!pushManager) return
        const subscription = await pushManager.getSubscription()

        await subscription?.unsubscribe()
      },
      permission
    }
  }, [pushManager, permission])

  return <WebPushContext.Provider value={value}>{children}</WebPushContext.Provider>
}

export const useWebPush = (): ContextProps => useContext(WebPushContext)
