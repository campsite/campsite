import { NextPageContext } from 'next'
import { useRouter } from 'next/router'

import { AppLayout } from '@/components/Layout/AppLayout'
import { PostView } from '@/components/Post/PostView'
import AuthAppProviders from '@/components/Providers/AuthAppProviders'
import { SsrSecretHeader } from '@/utils/apiCookieHeaders'
import { apiClient } from '@/utils/queryClient'
import { PageWithLayout } from '@/utils/types'

export interface PostRouteQuery {
  org: string
  postId: string
  // attachment ID
  a?: string
  // canvas comment ID
  cc?: string
  // comment attachment ID
  ca?: string
  // figma_file_preview_mode
  f?: string
  // transcription timestamp
  t?: string
  // inline gallery ID
  g?: string
  project_id?: string
  key?: string
}

const PostPage: PageWithLayout<any> = () => {
  const postId = useRouter().query.postId as string | undefined

  if (!postId) {
    return null
  }

  return <PostView />
}

PostPage.getInitialProps = async ({ asPath }: NextPageContext) => {
  // Don't run this code on the client during page transitions.
  if (typeof window !== 'undefined') {
    return {}
  }

  const params = asPath?.match(/\/(?<org>[^/]+)\/posts\/(?<postId>[^/?]+)\/?/)?.groups

  if (params?.postId === 'new') {
    return {}
  }

  try {
    const postSeoInfo = await apiClient.organizations.getPostsSeoInfo().request(`${params?.org}`, `${params?.postId}`, {
      headers: SsrSecretHeader
    })

    return { postSeoInfo }
  } catch {
    return {}
  }
}

PostPage.getProviders = (page, pageProps) => {
  return (
    <AuthAppProviders {...pageProps} allowLoggedOut>
      <AppLayout {...pageProps}>{page}</AppLayout>
    </AuthAppProviders>
  )
}

export default PostPage
