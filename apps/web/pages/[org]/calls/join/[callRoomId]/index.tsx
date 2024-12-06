import { useEffect, useRef, useState } from 'react'
import { nativeWindow } from '@todesktop/client-core'
import Head from 'next/head'
import { useRouter } from 'next/router'

import { useIsDesktopApp } from '@campsite/ui/hooks'
import { desktopJoinCall } from '@campsite/ui/Link'

import { CallRoom } from '@/components/CallRoom'
import { CopyCurrentUrl } from '@/components/CopyCurrentUrl'
import { FullPageLoading } from '@/components/FullPageLoading'
import AuthAppProviders from '@/components/Providers/AuthAppProviders'
import { PageWithLayout } from '@/utils/types'

const CallRoomPage: PageWithLayout<any> = () => {
  const router = useRouter()
  const callRoomId = router.query.callRoomId as string
  const { isMaybeDesktopMainWindow } = useForceDesktopCallWindow()

  if (isMaybeDesktopMainWindow) return <FullPageLoading />

  return (
    <>
      <Head>
        <title>Call</title>
      </Head>

      <CopyCurrentUrl />
      <CallRoom callRoomId={callRoomId} />
    </>
  )
}

CallRoomPage.getProviders = (page, pageProps) => {
  return (
    <AuthAppProviders {...pageProps} allowLoggedOut>
      {page}
    </AuthAppProviders>
  )
}

/*
 * In the Desktop app, this hook prevents calls opened from links outside of the app from hijacking the main window.
 * We try to intercept call links from outside of the app by listening for ToDesktop's openProtocolUrl event, but
 * there are two cases when we need to fallback to this hook:
 *
 * 1. When a user clicks a call link outside of the app and the Desktop app is not already open, we haven't
 *    subscribed to the openProtocolUrl event before hitting this route.
 * 2. Sometimes, we aren't able to preventDefault() in the openProtocolUrl event handler before this route loads.
 *    We're not sure why this happens, and we can't reproduce it consistently.
 */
function useForceDesktopCallWindow() {
  const router = useRouter()
  const isDesktop = useIsDesktopApp()
  const [isMaybeDesktopMainWindow, setIsMaybeDesktopMainWindow] = useState(isDesktop)
  const didOpenCallWindowRef = useRef(false)

  useEffect(() => {
    if (!isDesktop) return

    nativeWindow.getAllWindows().then((windows) => {
      const thisIsTheMainWindow = windows.length === 1

      if (!thisIsTheMainWindow) {
        setIsMaybeDesktopMainWindow(false)
        return
      }

      if (didOpenCallWindowRef.current) return
      didOpenCallWindowRef.current = true

      desktopJoinCall(window.location.href)

      // Navigate main window to the app root if Desktop app wasn't already open.
      router.replace('/')
      // Navigate main window back to the page the user was on if the window was already open.
      router.back()
    })
  }, [isDesktop, router])

  return { isMaybeDesktopMainWindow }
}

export default CallRoomPage
