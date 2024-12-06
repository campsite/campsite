import Head from 'next/head'

import { CopyCurrentUrl } from '@/components/CopyCurrentUrl'
import { DraftsIndex } from '@/components/Drafts'
import { AppLayout } from '@/components/Layout/AppLayout'
import AuthAppProviders from '@/components/Providers/AuthAppProviders'
import { PageWithLayout } from '@/utils/types'

const DraftsPage: PageWithLayout<any> = () => {
  return (
    <>
      <Head>
        <title>Drafts</title>
      </Head>

      <CopyCurrentUrl />
      <DraftsIndex />
    </>
  )
}

DraftsPage.getProviders = (page, pageProps) => {
  return (
    <AuthAppProviders {...pageProps}>
      <AppLayout {...pageProps}>{page}</AppLayout>
    </AuthAppProviders>
  )
}

export default DraftsPage
