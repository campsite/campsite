import { useRouter } from 'next/router'

import { AppLayout } from '@/components/Layout/AppLayout'
import AuthAppProviders from '@/components/Providers/AuthAppProviders'
import { NewIntegrationThread, NewMemberThread } from '@/components/Thread/NewThread'
import { PageWithLayout } from '@/utils/types'

const NewChatPage: PageWithLayout<any> = () => {
  const router = useRouter()
  const username = router.query.username as string | undefined
  const oauthApplicationId = router.query.oauth_application_id as string | undefined

  if (oauthApplicationId) {
    return <NewIntegrationThread oauthApplicationId={oauthApplicationId} />
  }

  if (username) {
    return <NewMemberThread username={username} />
  }

  return null
}

NewChatPage.getProviders = (page, pageProps) => {
  return (
    <AuthAppProviders {...pageProps}>
      <AppLayout {...pageProps}>{page}</AppLayout>
    </AuthAppProviders>
  )
}

export default NewChatPage
