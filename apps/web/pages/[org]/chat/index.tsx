import { useRouter } from 'next/router'

import { AppLayout } from '@/components/Layout/AppLayout'
import AuthAppProviders from '@/components/Providers/AuthAppProviders'
import { ThreadDetail } from '@/components/ThreadDetail'
import { ThreadSplitView } from '@/components/ThreadSplitView'
import { PageWithLayout } from '@/utils/types'

const ChatPage: PageWithLayout<any> = () => {
  const router = useRouter()
  const threadId = router.query.threadId as string

  return (
    <ThreadSplitView>
      <ThreadDetail key={threadId} />
    </ThreadSplitView>
  )
}

ChatPage.getProviders = (page, pageProps) => {
  return (
    <AuthAppProviders {...pageProps}>
      <AppLayout {...pageProps}>{page}</AppLayout>
    </AuthAppProviders>
  )
}

export default ChatPage
