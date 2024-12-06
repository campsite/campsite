import { Fragment } from 'react'
import { useGetTag } from 'hooks/useGetTag'
import Head from 'next/head'
import { useRouter } from 'next/router'

import { CopyCurrentUrl } from '@/components/CopyCurrentUrl'
import { FullPageLoading } from '@/components/FullPageLoading'
import { AppLayout } from '@/components/Layout/AppLayout'
import AuthAppProviders from '@/components/Providers/AuthAppProviders'
import { Tag404 } from '@/components/Tags/Tag404'
import { TagPageComponent } from '@/components/Tags/TagPageComponent'
import { PageWithLayout } from '@/utils/types'

const TagPage: PageWithLayout<any> = () => {
  const router = useRouter()
  const getTag = useGetTag(router.query.tagName as string)

  if (getTag.isLoading) return <FullPageLoading />
  if (getTag.isError) return <Tag404 />
  if (!getTag.data) return <Tag404 />

  const tag = getTag.data

  return (
    <Fragment key={tag.id}>
      <Head>
        <title>{tag.name}</title>
      </Head>

      <CopyCurrentUrl />
      <TagPageComponent />
    </Fragment>
  )
}

TagPage.getProviders = (page, pageProps) => {
  return (
    <AuthAppProviders {...pageProps}>
      <AppLayout {...pageProps}>{page}</AppLayout>
    </AuthAppProviders>
  )
}

export default TagPage
