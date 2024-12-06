import Head from 'next/head'

import { AppLayout } from '@/components/Layout/AppLayout'
import { NotesIndex } from '@/components/NotesIndex'
import AuthAppProviders from '@/components/Providers/AuthAppProviders'
import { PageWithLayout } from '@/utils/types'

const NotesPage: PageWithLayout<any> = () => {
  return (
    <>
      <Head>
        <title>Docs</title>
      </Head>

      <NotesIndex />
    </>
  )
}

NotesPage.getProviders = (page, pageProps) => {
  return (
    <AuthAppProviders {...pageProps}>
      <AppLayout {...pageProps}>{page}</AppLayout>
    </AuthAppProviders>
  )
}

export default NotesPage
