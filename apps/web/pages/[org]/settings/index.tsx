import { ProfileDisplay } from 'components/OrgSettings/ProfileDisplay'
import Head from 'next/head'

import { CopyCurrentUrl } from '@/components/CopyCurrentUrl'
import { Squiggle } from '@/components/Onboarding/OnboardingPosts'
import { DataExport } from '@/components/OrgSettings/DataExport'
import { DeleteCampsite } from '@/components/OrgSettings/DeleteCampsite'
import { OrgSettingsPageWrapper } from '@/components/OrgSettings/PageWrapper'
import { SingleSignOn } from '@/components/OrgSettings/SingleSignOn'
import { SingleSignOnUpsell } from '@/components/OrgSettings/SingleSignOn/Upsell'
import { VerifiedDomain } from '@/components/OrgSettings/VerifiedDomain'
import { InboundRequests } from '@/components/People/InboundRequests'
import AuthAppProviders from '@/components/Providers/AuthAppProviders'
import { useCurrentOrganizationHasFeature } from '@/hooks/useCurrentOrganizationHasFeature'
import { useGetCurrentOrganization } from '@/hooks/useGetCurrentOrganization'
import { useViewerIsAdmin } from '@/hooks/useViewerIsAdmin'
import { PageWithLayout } from '@/utils/types'

const OrganizationSettingsPage: PageWithLayout<any> = () => {
  const getCurrentOrganization = useGetCurrentOrganization()
  const currentOrganization = getCurrentOrganization.data
  const viewerIsAdmin = useViewerIsAdmin()
  const showSSO = useCurrentOrganizationHasFeature('organization_sso')

  return (
    <>
      <Head>
        <title>{`${currentOrganization?.name} settings`}</title>
      </Head>

      <CopyCurrentUrl />

      <OrgSettingsPageWrapper>
        {viewerIsAdmin && (
          <>
            <InboundRequests />
            <ProfileDisplay />
            <VerifiedDomain />
            {showSSO ? <SingleSignOn /> : <SingleSignOnUpsell />}
            <DataExport />
            <Squiggle />
            <DeleteCampsite />
          </>
        )}
      </OrgSettingsPageWrapper>
    </>
  )
}

OrganizationSettingsPage.getProviders = (page, pageProps) => {
  return <AuthAppProviders {...pageProps}>{page}</AuthAppProviders>
}

export default OrganizationSettingsPage
