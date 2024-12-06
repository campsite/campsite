import { nativeWindow } from '@todesktop/client-core'

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
      // ToDesktop sets the icon for Desktop, including it in the icon property will make it appear twice.
      icon: isDesktop ? undefined : '/meta/apple-touch-icon-192.png'
    })

    notification.onclick = (e) => {
      e.preventDefault()
      isDesktop ? nativeWindow.restore() : window.focus()
      onClick?.()
      notification.close()
    }
  }
}
