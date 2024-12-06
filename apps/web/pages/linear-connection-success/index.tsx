import { useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'

import AuthAppProviders from '@/components/Providers/AuthAppProviders'
import { PageWithProviders } from '@/utils/types'

export const linearConnectionSuccessMessage = 'linear-connection-success'

const LinearConnectionSuccessPage: PageWithProviders<any> = () => {
  const router = useRouter()

  useEffect(() => {
    if (window.opener) {
      window.opener.postMessage(linearConnectionSuccessMessage)
      window.close()
      return
    }

    router.replace(`/`)
  }, [router])

  return (
    <Head>
      <title>Successfully connected to Linear</title>
    </Head>
  )
}

LinearConnectionSuccessPage.getProviders = (page, pageProps) => {
  return <AuthAppProviders {...pageProps}>{page}</AuthAppProviders>
}

export default LinearConnectionSuccessPage
