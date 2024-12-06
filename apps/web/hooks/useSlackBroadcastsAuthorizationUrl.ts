import { useRouter } from 'next/router'

import { ALL_SLACK_SCOPES, RAILS_API_URL } from '@campsite/config'
import { PublicOrganization } from '@campsite/types'

import { useScope } from '@/contexts/scope'

import { useIntegrationAuthUrl } from './useIntegrationAuthUrl'
import { useSlackAuthorizationUrl } from './useSlackAuthorizationUrl'

export const useSlackBroadcastsAuthorizationUrl = ({
  organization,
  enableNotifications
}: {
  organization?: PublicOrganization
  enableNotifications?: boolean
}) => {
  const { asPath } = useRouter()
  const { scope } = useScope()
  const organizationSlug = organization?.slug || scope
  const redirectUri = `${RAILS_API_URL}/v1/organizations/${organizationSlug}/integrations/slack/callback`
  const auth_url = useSlackAuthorizationUrl({ scopes: ALL_SLACK_SCOPES, redirectUri })

  return useIntegrationAuthUrl({ auth_url, success_path: asPath, enable_notifications: enableNotifications })
}
