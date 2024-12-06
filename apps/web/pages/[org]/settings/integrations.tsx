import Head from 'next/head'

import { CopyCurrentUrl } from '@/components/CopyCurrentUrl'
import { LinearIntegration } from '@/components/OrgSettings/LinearIntegration'
import { OrganizationOauthApplications } from '@/components/OrgSettings/OauthApplications'
import { OrgSettingsPageWrapper } from '@/components/OrgSettings/PageWrapper'
import { SlackIntegration } from '@/components/OrgSettings/SlackIntegration'
import { ZapierIntegration } from '@/components/OrgSettings/ZapierIntegration'
import AuthAppProviders from '@/components/Providers/AuthAppProviders'
import { useGetCurrentOrganization } from '@/hooks/useGetCurrentOrganization'
import { useGetOauthApplications } from '@/hooks/useGetOauthApplications'
import { useViewerIsAdmin } from '@/hooks/useViewerIsAdmin'
import { PageWithLayout } from '@/utils/types'

const OrganizationIntegrationsPage: PageWithLayout<any> = () => {
  const { data: currentOrganization } = useGetCurrentOrganization()
  const isAdmin = useViewerIsAdmin()

  // prefetch queries and keep them active to avoid flickers when switching tabs
  useGetOauthApplications()

  return (
    <>
      <Head>
        <title>{`${currentOrganization?.name} integrations`}</title>
      </Head>

      <CopyCurrentUrl />
      <OrgSettingsPageWrapper>
        {isAdmin && <LinearIntegration />}
        {isAdmin && <SlackIntegration />}
        {isAdmin && <ZapierIntegration />}
        <OrganizationOauthApplications />
      </OrgSettingsPageWrapper>
    </>
  )
}

OrganizationIntegrationsPage.getProviders = (page, pageProps) => {
  return <AuthAppProviders {...pageProps}>{page}</AuthAppProviders>
}

export default OrganizationIntegrationsPage
