import { Fragment } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'

import { CopyCurrentUrl } from '@/components/CopyCurrentUrl'
import { FullPageLoading } from '@/components/FullPageLoading'
import { AppLayout } from '@/components/Layout/AppLayout'
import { OrganizationMember404 } from '@/components/OrganizationMember/Member404'
import { OrganizationMemberPageComponent } from '@/components/OrganizationMember/OrganizationMemberPageComponent'
import AuthAppProviders from '@/components/Providers/AuthAppProviders'
import { useGetOrganizationMember } from '@/hooks/useGetOrganizationMember'
import { PageWithLayout } from '@/utils/types'

const OrganizationMemberPage: PageWithLayout<any> = () => {
  const router = useRouter()
  const username = router.query.username as string
  const getMember = useGetOrganizationMember({ username })

  if (getMember.isLoading) return <FullPageLoading />
  if (getMember.isError) return <OrganizationMember404 />
  if (!getMember.data) return <OrganizationMember404 />

  return (
    <Fragment key={getMember.data.id}>
      <Head>
        <title>{getMember.data.user.display_name}</title>
      </Head>

      <CopyCurrentUrl />
      <OrganizationMemberPageComponent />
    </Fragment>
  )
}

OrganizationMemberPage.getProviders = (page, pageProps) => {
  return (
    <AuthAppProviders {...pageProps}>
      <AppLayout {...pageProps}>{page}</AppLayout>
    </AuthAppProviders>
  )
}

export default OrganizationMemberPage
