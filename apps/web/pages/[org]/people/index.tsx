import Head from 'next/head'

import { CopyCurrentUrl } from '@/components/CopyCurrentUrl'
import { AppLayout } from '@/components/Layout/AppLayout'
import { PeopleIndex } from '@/components/People/PeopleIndex'
import AuthAppProviders from '@/components/Providers/AuthAppProviders'
import { PageWithLayout } from '@/utils/types'

const PeoplePage: PageWithLayout<any> = () => {
  return (
    <>
      <Head>
        <title>People</title>
      </Head>

      <CopyCurrentUrl />
      <PeopleIndex />
    </>
  )
}

PeoplePage.getProviders = (page, pageProps) => {
  return (
    <AuthAppProviders {...pageProps}>
      <AppLayout {...pageProps}>{page}</AppLayout>
    </AuthAppProviders>
  )
}

export default PeoplePage
