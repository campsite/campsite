import { useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'

import AuthAppProviders from '@/components/Providers/AuthAppProviders'
import { PageWithProviders } from '@/utils/types'

export const figmaConnectionSuccessMessage = 'figma-connection-success'

const FigmaConnectionSuccessPage: PageWithProviders<any> = () => {
  const router = useRouter()

  useEffect(() => {
    if (window.opener) {
      window.opener.postMessage(figmaConnectionSuccessMessage)
      window.close()
      return
    }

    router.replace(`/`)
  }, [router])

  return (
    <Head>
      <title>Successfully connected to Figma</title>
    </Head>
  )
}

FigmaConnectionSuccessPage.getProviders = (page, pageProps) => {
  return <AuthAppProviders {...pageProps}>{page}</AuthAppProviders>
}

export default FigmaConnectionSuccessPage
