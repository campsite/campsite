import { RAILS_API_URL, SLACK_NOTIFICATION_SCOPES } from '@campsite/config'
import { PublicOrganization } from '@campsite/types'

import { useIntegrationAuthUrl } from './useIntegrationAuthUrl'
import { useSlackAuthorizationUrl } from './useSlackAuthorizationUrl'

export const useSlackNotificationsAuthorizationUrl = ({
  organization,
  teamId
}: {
  organization: PublicOrganization
  teamId?: string | null
}) => {
  const redirectUri = `${RAILS_API_URL}/v1/organizations/${organization.slug}/integrations/slack/notifications_callback`
  const auth_url = useSlackAuthorizationUrl({ scopes: SLACK_NOTIFICATION_SCOPES, redirectUri, teamId })

  return useIntegrationAuthUrl({ auth_url })
}
