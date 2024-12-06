import { useRouter } from 'next/router'

import { CopyCurrentUrl } from '@/components/CopyCurrentUrl'
import { AppLayout } from '@/components/Layout/AppLayout'
import { PostVersionsFeed } from '@/components/Post/VersionsFeed'
import AuthAppProviders from '@/components/Providers/AuthAppProviders'
import { PageWithLayout } from '@/utils/types'

const PostPage: PageWithLayout<any> = () => {
  const router = useRouter()
  const postId = router.query?.postId ?? ''

  if (!postId) return null

  return (
    <>
      <CopyCurrentUrl />
      <PostVersionsFeed />
    </>
  )
}

PostPage.getProviders = (page, pageProps) => {
  return (
    <AuthAppProviders {...pageProps}>
      <AppLayout {...pageProps}>{page}</AppLayout>
    </AuthAppProviders>
  )
}

export default PostPage
