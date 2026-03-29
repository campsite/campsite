import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import * as Sentry from '@sentry/nextjs'

import { WEB_PUSH_PUBLIC_KEY } from '@campsite/config'

import { useIsPWA } from '@/hooks/useIsPWA'

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
let hasWarnedMissingWebPushKey = false

interface Props {
  children: React.ReactNode
}

// @ts-ignore
const conv = (val) => btoa(String.fromCharCode.apply(null, new Uint8Array(val)))

async function postPushSubscription(body: { old_endpoint?: string | null; new_endpoint: string; p256dh: string; auth: string }) {
  const response = await fetch('/v1/push_subscriptions', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })

  if (!response.ok) {
    throw new Error(`Push subscription request failed with status ${response.status}`)
  }
}

export const WebPushProvider: React.FC<Props> = ({ children }) => {
  const [permission, setPermission] = useState(() => ('Notification' in window ? Notification.permission : 'denied'))
  const [pushManager, setPushManager] = useState<PushManager | null>(null)
  const canPush = useIsPWA()
  const hasWebPushKey = !!WEB_PUSH_PUBLIC_KEY

  useEffect(() => {
    if (!canPush || hasWebPushKey || hasWarnedMissingWebPushKey) {
      return
    }

    hasWarnedMissingWebPushKey = true
    console.warn('Web push is not configured. Set NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY to enable push subscriptions.')
  }, [canPush, hasWebPushKey])

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
    if (!canPush || !pushManager || !hasWebPushKey) return

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

        await postPushSubscription({
          new_endpoint: subscription.endpoint,
          p256dh,
          auth
        })
      } else if (permission === 'denied' && existingSubscription) {
        await existingSubscription.unsubscribe()
      }
    }

    run().catch((error) => Sentry.captureException(error))
  }, [permission, pushManager, canPush, hasWebPushKey])

  useEffect(() => {
    if (canPush && hasWebPushKey && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service_worker.js').then(
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
  }, [canPush, hasWebPushKey])

  const value = useMemo(() => {
    return {
      subscribe: async () => {
        if (!hasWebPushKey) return

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
  }, [hasWebPushKey, pushManager, permission])

  return <WebPushContext.Provider value={value}>{children}</WebPushContext.Provider>
}

export const useWebPush = (): ContextProps => useContext(WebPushContext)
