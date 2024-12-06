import '@campsite/ui/src/styles/global.css'
import 'styles/global.css'

import { AppProps, NextWebVitalsMetric } from 'next/app'
import { Inter } from 'next/font/google'

import Providers from '../components/Providers'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter'
})

export default function App({ Component, pageProps: { ...pageProps } }: AppProps) {
  return (
    <>
      <style jsx global>{`
        :root {
          --font-inter: ${inter.style.fontFamily};
        }
      `}</style>
      <Providers router='pages'>
        <Component {...pageProps} />
      </Providers>
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
