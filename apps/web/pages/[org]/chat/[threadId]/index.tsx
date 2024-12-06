import { useRouter } from 'next/router'

import { CopyCurrentUrl } from '@/components/CopyCurrentUrl'
import { AppLayout } from '@/components/Layout/AppLayout'
import AuthAppProviders from '@/components/Providers/AuthAppProviders'
import { ThreadDetail } from '@/components/ThreadDetail'
import { ThreadSplitView } from '@/components/ThreadSplitView'
import { PageWithLayout } from '@/utils/types'

const ChatThreadPage: PageWithLayout<any> = () => {
  const router = useRouter()
  const threadId = router.query.threadId as string

  return (
    <>
      <CopyCurrentUrl />
      <ThreadSplitView>
        <ThreadDetail key={threadId} />
      </ThreadSplitView>
    </>
  )
}

ChatThreadPage.getProviders = (page, pageProps) => {
  return (
    <AuthAppProviders {...pageProps}>
      <AppLayout {...pageProps}>{page}</AppLayout>
    </AuthAppProviders>
  )
}

export default ChatThreadPage
