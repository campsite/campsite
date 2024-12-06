import { useEffect } from 'react'
import Head from 'next/head'

import { COMMUNITY_SLUG } from '@campsite/config'

import { JoinCommunityPageComponent } from '@/components/JoinCommunity'
import AuthAppProviders from '@/components/Providers/AuthAppProviders'
import { useScope } from '@/contexts/scope'
import { PageWithLayout } from '@/utils/types'

const JoinCommunityPage: PageWithLayout<any> = () => {
  const { setScope } = useScope()

  useEffect(() => {
    setScope(COMMUNITY_SLUG)
  }, [setScope])

  return (
    <>
      <Head>
        <title>Campsite Design Community</title>
      </Head>

      <JoinCommunityPageComponent />
    </>
  )
}

JoinCommunityPage.getProviders = (page, pageProps) => {
  return <AuthAppProviders {...pageProps}>{page}</AuthAppProviders>
}

export default JoinCommunityPage
