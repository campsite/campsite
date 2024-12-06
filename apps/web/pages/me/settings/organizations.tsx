import Head from 'next/head'

import { CopyCurrentUrl } from '@/components/CopyCurrentUrl'
import AuthAppProviders from '@/components/Providers/AuthAppProviders'
import { OrganizationInvitationsTable } from '@/components/UserSettings/OrganizationInvitationsTable'
import { OrganizationsTable } from '@/components/UserSettings/OrganizationsTable/OrganizationsTable'
import { UserSettingsPageWrapper } from '@/components/UserSettings/PageWrapper'
import { SuggestedOrganizationsTable } from '@/components/UserSettings/SuggestedOrganizationsTable'
import { PageWithProviders } from '@/utils/types'

const UserSettingsPage: PageWithProviders<any> = () => {
  return (
    <>
      <Head>
        <title>My Organizations</title>
      </Head>

      <CopyCurrentUrl />

      <UserSettingsPageWrapper>
        <OrganizationInvitationsTable />
        <SuggestedOrganizationsTable />
        <OrganizationsTable />
      </UserSettingsPageWrapper>
    </>
  )
}

UserSettingsPage.getProviders = (page, pageProps) => {
  return <AuthAppProviders {...pageProps}>{page}</AuthAppProviders>
}

export default UserSettingsPage
