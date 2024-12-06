import Head from 'next/head'

import { CallsIndex } from '@/components/Calls'
import { AppLayout } from '@/components/Layout/AppLayout'
import AuthAppProviders from '@/components/Providers/AuthAppProviders'
import { PageWithLayout } from '@/utils/types'

const CallsPage: PageWithLayout<any> = () => {
  return (
    <>
      <Head>
        <title>Calls</title>
      </Head>

      <CallsIndex />
    </>
  )
}

CallsPage.getProviders = (page, pageProps) => {
  return (
    <AuthAppProviders {...pageProps}>
      <AppLayout {...pageProps}>{page}</AppLayout>
    </AuthAppProviders>
  )
}

export default CallsPage
