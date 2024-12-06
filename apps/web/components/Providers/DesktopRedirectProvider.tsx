import { useEffect, useState } from 'react'
import Head from 'next/head'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { isMobile } from 'react-device-detect'

import { DESKTOP_APP_PROTOCOL } from '@campsite/config'
import { Button, Title3 } from '@campsite/ui'
import { useHasMounted, useIsDesktopApp } from '@campsite/ui/src/hooks'

import { FullPageLoading } from '@/components/FullPageLoading'
import { useGetCurrentUser } from '@/hooks/useGetCurrentUser'

export function DesktopRedirectProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { data: currentUser, isLoading } = useGetCurrentUser()
  const isDesktop = useIsDesktopApp()
  const hasMounted = useHasMounted()
  const isReady = hasMounted && router.isReady && !isLoading
  const preferenceEnabled = currentUser?.preferences?.prefers_desktop_app === 'enabled'
  const [interstitialState, setInterstitialState] = useState<'shown' | 'not-shown' | 'not-ready'>('not-ready')

  useEffect(() => {
    if (!isReady) return

    if (preferenceEnabled && !isMobile && !isDesktop && router.query.browser !== 'true') {
      setInterstitialState('shown')

      window.location.href = `${DESKTOP_APP_PROTOCOL}/${router.asPath}`
    } else {
      setInterstitialState('not-shown')
    }

    /*
      We don't get results from `useIsDesktop` until after the first render, so by waiting
      until the _second_ render (when `hasMounted` is true), we can ensure that this effect
      will not trigger the redirect if the user is in the desktop app.

      We also need to ensure that this effect will not trigger until router.isReady is true.
      Otherwise, router.asPath could be incorrect.
      https://nextjs.org/docs/pages/api-reference/functions/use-router#router-object
    */
  }, [isReady]) // eslint-disable-line react-hooks/exhaustive-deps

  if (interstitialState === 'not-ready') {
    return <FullPageLoading />
  }

  if (interstitialState === 'not-shown') {
    return <>{children}</>
  }

  return (
    <>
      <Head>
        <title>Open in Desktop · Campsite</title>
      </Head>
      <main className='flex h-screen w-full flex-col'>
        <div className='flex w-full flex-1 flex-col items-center justify-center gap-4'>
          <Image alt='App icon for Campsite desktop app' src='/img/desktop-app-icon.png' width={144} height={144} />
          <Title3>Opened in the Campsite app</Title3>
          <Button onClick={() => setInterstitialState('not-shown')}>View in browser</Button>
        </div>
      </main>
    </>
  )
}
