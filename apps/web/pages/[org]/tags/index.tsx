import Head from 'next/head'

import { CopyCurrentUrl } from '@/components/CopyCurrentUrl'
import { AppLayout } from '@/components/Layout/AppLayout'
import AuthAppProviders from '@/components/Providers/AuthAppProviders'
import { TagsIndex } from '@/components/Tags/TagList'
import { PageWithLayout } from '@/utils/types'

const TagsPage: PageWithLayout<any> = () => {
  return (
    <>
      <Head>
        <title>Tags</title>
      </Head>

      <CopyCurrentUrl />
      <TagsIndex />
    </>
  )
}

TagsPage.getProviders = (page, pageProps) => {
  return (
    <AuthAppProviders {...pageProps}>
      <AppLayout {...pageProps}>{page}</AppLayout>
    </AuthAppProviders>
  )
}

export default TagsPage
