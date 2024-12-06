import Head from 'next/head'
import { useRouter } from 'next/router'

import { CallView } from '@/components/CallView'
import { AppLayout } from '@/components/Layout/AppLayout'
import AuthAppProviders from '@/components/Providers/AuthAppProviders'
import { PageWithLayout } from '@/utils/types'

const CallPage: PageWithLayout<any> = () => {
  const router = useRouter()
  const callId = router.query.callId as string

  return (
    <>
      <Head>
        <title>Calls</title>
      </Head>

      <CallView callId={callId} />
    </>
  )
}

CallPage.getProviders = (page, pageProps) => {
  return (
    <AuthAppProviders {...pageProps}>
      <AppLayout {...pageProps}>{page}</AppLayout>
    </AuthAppProviders>
  )
}

export default CallPage
