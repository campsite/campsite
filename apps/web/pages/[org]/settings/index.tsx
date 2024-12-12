import { ProfileDisplay } from 'components/OrgSettings/ProfileDisplay'
import Head from 'next/head'

import { CopyCurrentUrl } from '@/components/CopyCurrentUrl'
import { Squiggle } from '@/components/Onboarding/OnboardingPosts'
import { DataExport } from '@/components/OrgSettings/DataExport'
import { DeleteCampsite } from '@/components/OrgSettings/DeleteCampsite'
import { OrgSettingsPageWrapper } from '@/components/OrgSettings/PageWrapper'
import { VerifiedDomain } from '@/components/OrgSettings/VerifiedDomain'
import { InboundRequests } from '@/components/People/InboundRequests'
import AuthAppProviders from '@/components/Providers/AuthAppProviders'
import { useGetCurrentOrganization } from '@/hooks/useGetCurrentOrganization'
import { useViewerIsAdmin } from '@/hooks/useViewerIsAdmin'
import { PageWithLayout } from '@/utils/types'

const OrganizationSettingsPage: PageWithLayout<any> = () => {
  const getCurrentOrganization = useGetCurrentOrganization()
  const currentOrganization = getCurrentOrganization.data
  const viewerIsAdmin = useViewerIsAdmin()

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
