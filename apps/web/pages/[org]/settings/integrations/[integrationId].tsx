import Head from 'next/head'
import { useRouter } from 'next/router'

import { ArrowLeftIcon } from '@campsite/ui/Icons'
import { Link } from '@campsite/ui/Link'

import { CopyCurrentUrl } from '@/components/CopyCurrentUrl'
import { FullPageError } from '@/components/Error'
import { Squiggle } from '@/components/Onboarding/OnboardingPosts'
import { ApiKeys } from '@/components/OrgSettings/OauthApplications/ApiKeys'
import { DeleteIntegration } from '@/components/OrgSettings/OauthApplications/DeleteIntegration'
import { GeneralSettings } from '@/components/OrgSettings/OauthApplications/GeneralSettings'
import { OauthSettings } from '@/components/OrgSettings/OauthApplications/OauthSettings'
import { Webhooks } from '@/components/OrgSettings/OauthApplications/Webhooks'
import { OrgSettingsPageWrapper } from '@/components/OrgSettings/PageWrapper'
import AuthAppProviders from '@/components/Providers/AuthAppProviders'
import { useScope } from '@/contexts/scope'
import { useCurrentOrganizationHasFeature } from '@/hooks/useCurrentOrganizationHasFeature'
import { useGetCurrentOrganization } from '@/hooks/useGetCurrentOrganization'
import { useGetOauthApplication } from '@/hooks/useGetOauthApplication'
import { useViewerCanManageIntegrations } from '@/hooks/useViewerCanManageIntegrations'
import { PageWithLayout } from '@/utils/types'

const IntegrationSettingsPage: PageWithLayout<any> = () => {
  const getCurrentOrganization = useGetCurrentOrganization()
  const currentOrganization = getCurrentOrganization.data
  const { viewerCanManageIntegrations } = useViewerCanManageIntegrations()
  const { scope } = useScope()
  const { integrationId } = useRouter().query
  const { data: oauthApplication } = useGetOauthApplication(integrationId as string)
  const hasMultiOrgApps = useCurrentOrganizationHasFeature('multi_org_apps')
  const backPath = `/${scope}/settings/integrations/`

  if (!viewerCanManageIntegrations) {
    return <FullPageError title='Unauthorized' message='You are not authorized to access this page' />
  }

  return (
    <>
      <Head>
        <title>{`${currentOrganization?.name} settings`}</title>
      </Head>

      <CopyCurrentUrl />

      <OrgSettingsPageWrapper backPath={backPath}>
        {oauthApplication && (
          <>
            <div>
              <Link href={backPath} className='flex items-center gap-1 text-sm font-medium text-blue-500'>
                <ArrowLeftIcon />
                Back to integrations
              </Link>
            </div>
            <GeneralSettings oauthApplication={oauthApplication} />
            <ApiKeys oauthApplication={oauthApplication} />
            <Webhooks oauthApplication={oauthApplication} />
            {hasMultiOrgApps && <OauthSettings oauthApplication={oauthApplication} />}
            <Squiggle />
            <DeleteIntegration oauthApplication={oauthApplication} />
          </>
        )}
      </OrgSettingsPageWrapper>
    </>
  )
}

IntegrationSettingsPage.getProviders = (page, pageProps) => {
  return <AuthAppProviders {...pageProps}>{page}</AuthAppProviders>
}

export default IntegrationSettingsPage
