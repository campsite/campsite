import { nativeWindow } from '@/utils/electron-bridge'

import { useIsDesktopApp } from '@campsite/ui/hooks'

interface Options {
  title: string
  tag: string
  body?: string
  onClick?: () => void
}

export function useCreateDesktopOrBrowserNotification() {
  const isDesktop = useIsDesktopApp()

  return ({ title, tag, body, onClick }: Options) => {
    const notification = new Notification(title, {
      body,
      tag,
      icon: '/meta/apple-touch-icon-192.png'
    })

    notification.onclick = (e) => {
      e.preventDefault()
      isDesktop ? nativeWindow.restore() : window.focus()
      onClick?.()
      notification.close()
    }
  }
}
