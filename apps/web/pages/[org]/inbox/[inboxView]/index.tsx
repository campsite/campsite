import Head from 'next/head'
import { useRouter } from 'next/router'

import { InboxSplitView, InboxView } from '@/components/InboxItems/InboxSplitView'
import { AppLayout } from '@/components/Layout/AppLayout'
import { AuthAppProviders } from '@/components/Providers/AuthAppProviders'
import { PageWithLayout } from '@/utils/types'

const OrganizationInboxPage: PageWithLayout<any> = () => {
  const router = useRouter()

  return (
    <>
      <Head>
        <title>Inbox</title>
      </Head>

      <InboxSplitView key={`${router.query.org}`} view={router.query.inboxView as InboxView} />
    </>
  )
}

OrganizationInboxPage.getProviders = (page, pageProps) => {
  return (
    <AuthAppProviders {...pageProps}>
      <AppLayout {...pageProps}>{page}</AppLayout>
    </AuthAppProviders>
  )
}

export default OrganizationInboxPage
