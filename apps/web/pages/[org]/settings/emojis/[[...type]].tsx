import Head from 'next/head'
import { useRouter } from 'next/router'

import { CopyCurrentUrl } from '@/components/CopyCurrentUrl'
import { OrganizationReactions } from '@/components/OrgSettings/OrganizationReactions'
import { OrgSettingsPageWrapper } from '@/components/OrgSettings/PageWrapper'
import AuthAppProviders from '@/components/Providers/AuthAppProviders'
import { useGetCurrentOrganization } from '@/hooks/useGetCurrentOrganization'
import { useGetCustomReactions } from '@/hooks/useGetCustomReactions'
import { useGetCustomReactionsPacks } from '@/hooks/useGetCustomReactionsPacks'
import { PageWithLayout } from '@/utils/types'

const OrganizationReactionsPage: PageWithLayout<any> = () => {
  const { data: currentOrganization } = useGetCurrentOrganization()
  const { query } = useRouter()
  const queryType = query.type?.toString()
  const type = (queryType === 'packs' && 'packs') || 'library'

  // prefetch queries and keep them active to avoid flickers when switching tabs
  useGetCustomReactions()
  useGetCustomReactionsPacks()

  return (
    <>
      <Head>
        <title>{`${currentOrganization?.name} emojis`}</title>
      </Head>

      <CopyCurrentUrl />

      <OrgSettingsPageWrapper>
        <OrganizationReactions type={type} />
      </OrgSettingsPageWrapper>
    </>
  )
}

OrganizationReactionsPage.getProviders = (page, pageProps) => {
  return <AuthAppProviders {...pageProps}>{page}</AuthAppProviders>
}

export default OrganizationReactionsPage
