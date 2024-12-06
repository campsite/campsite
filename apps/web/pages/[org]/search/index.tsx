import Head from 'next/head'

import { CopyCurrentUrl } from '@/components/CopyCurrentUrl'
import { AppLayout } from '@/components/Layout/AppLayout'
import { AuthAppProviders } from '@/components/Providers/AuthAppProviders'
import { SearchIndex } from '@/components/SearchIndex'
import { PageWithLayout } from '@/utils/types'

const OrganizationSearchPage: PageWithLayout<any> = () => {
  return (
    <>
      <Head>
        <title>Search</title>
      </Head>

      <CopyCurrentUrl />
      <SearchIndex />
    </>
  )
}

OrganizationSearchPage.getProviders = (page, pageProps) => {
  return (
    <AuthAppProviders {...pageProps}>
      <AppLayout {...pageProps}>{page}</AppLayout>
    </AuthAppProviders>
  )
}

export default OrganizationSearchPage
