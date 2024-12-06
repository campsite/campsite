import Head from 'next/head'

import { AppLayout } from '@/components/Layout/AppLayout'
import { MyWork } from '@/components/MyWork'
import AuthAppProviders from '@/components/Providers/AuthAppProviders'
import { useGetCurrentOrganization } from '@/hooks/useGetCurrentOrganization'
import { PageWithLayout } from '@/utils/types'

const PostsIndexPage: PageWithLayout<any> = () => {
  const getCurrentOrganization = useGetCurrentOrganization()
  const currentOrganization = getCurrentOrganization.data

  return (
    <>
      <Head>
        <title>{currentOrganization?.name} posts</title>
      </Head>

      <MyWork />
    </>
  )
}

PostsIndexPage.getProviders = (page, pageProps) => {
  return (
    <AuthAppProviders {...pageProps}>
      <AppLayout {...pageProps}>{page}</AppLayout>
    </AuthAppProviders>
  )
}

export default PostsIndexPage
