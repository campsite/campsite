import '@campsite/ui/src/styles/global.css' // applies to all packages
import '@campsite/ui/src/styles/code.css'
import 'styles/editor.css'
import 'styles/global.css' // web only
import 'styles/prose.css'

import { useEffect } from 'react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { NextWebVitalsMetric } from 'next/app'
import { Inter } from 'next/font/google'

import { IS_PRODUCTION, LAST_CLIENT_JS_BUILD_ID_LS_KEY } from '@campsite/config'

import { useClearEmptyDrafts } from '@/hooks/useClearEmptyDrafts'
import { useStoredState } from '@/hooks/useStoredState'
import { AppPropsWithLayout } from '@/utils/types'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter'
})

export default function App<T>({ Component, pageProps }: AppPropsWithLayout<T>): JSX.Element {
  const getProviders = Component.getProviders ?? ((page) => page)
  const [_, setLsLastChecked] = useStoredState<number | null>(LAST_CLIENT_JS_BUILD_ID_LS_KEY, null)

  // TODO: Delete this hook and implementation after 4/30/24
  useClearEmptyDrafts()

  /*
    Whenever the app mounts for the first time, track the current time in local storage
    as an indicator of when the user last loaded fresh javascript. We'll use this timestamp
    in the <RefreshPrompt /> component to determine if the user should be nudged to refresh
    the app and get the latest javascript.
  */
  useEffect(() => {
    setLsLastChecked(new Date().getTime())
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <style jsx global>{`
        :root {
          --font-inter: ${inter.style.fontFamily};
        }
      `}</style>

      {getProviders(<Component {...pageProps} />, {
        ...pageProps
      })}
      {IS_PRODUCTION && <SpeedInsights />}
    </>
  )
}

export function reportWebVitals(metric: NextWebVitalsMetric) {
  const url = process.env.NEXT_PUBLIC_AXIOM_INGEST_ENDPOINT

  if (!url) {
    return
  }

  const body = JSON.stringify({
    route: window.__NEXT_DATA__.page,
    ...metric
  })

  function sendFallback(url: string) {
    fetch(url, { body, method: 'POST', keepalive: true })
  }

  if (navigator.sendBeacon) {
    try {
      navigator.sendBeacon.bind(navigator)(url, body)
    } catch {
      sendFallback(url)
    }
  } else {
    sendFallback(url)
  }
}
