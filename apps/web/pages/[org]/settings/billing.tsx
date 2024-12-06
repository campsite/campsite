import Head from 'next/head'

import { CopyCurrentUrl } from '@/components/CopyCurrentUrl'
import { Billing } from '@/components/OrgSettings/Billing'
import { OrgSettingsPageWrapper } from '@/components/OrgSettings/PageWrapper'
import AuthAppProviders from '@/components/Providers/AuthAppProviders'
import { useGetCurrentOrganization } from '@/hooks/useGetCurrentOrganization'
import { PageWithLayout } from '@/utils/types'

const OrganizationBillingPage: PageWithLayout<any> = () => {
  const getCurrentOrganization = useGetCurrentOrganization()
  const currentOrganization = getCurrentOrganization.data

  return (
    <>
      <Head>
        <title>{`${currentOrganization?.name} billing`}</title>
      </Head>

      <CopyCurrentUrl />

      <OrgSettingsPageWrapper>
        <Billing />
      </OrgSettingsPageWrapper>
    </>
  )
}

OrganizationBillingPage.getProviders = (page, pageProps) => {
  return <AuthAppProviders {...pageProps}>{page}</AuthAppProviders>
}

export default OrganizationBillingPage
