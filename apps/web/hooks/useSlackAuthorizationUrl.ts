import { DEV_SLACKBOT_CLIENT_ID, SLACKBOT_CLIENT_ID } from 'lib/slack'
import { v4 as uuid } from 'uuid'

import { useCurrentUserHasFeature } from './useCurrentUserHasFeature'

export const useSlackAuthorizationUrl = ({
  scopes,
  redirectUri,
  teamId
}: {
  scopes: string[]
  redirectUri: string
  teamId?: string | null
}) => {
  const currentUserHasFeature = useCurrentUserHasFeature('force_dev_slackbot')

  const slackbotClientId = currentUserHasFeature ? DEV_SLACKBOT_CLIENT_ID : SLACKBOT_CLIENT_ID

  const params = new URLSearchParams()

  params.set('scope', scopes.join(','))
  params.set('state', uuid())
  params.set('redirect_uri', redirectUri)
  params.set('client_id', slackbotClientId)
  if (teamId) params.set('team', teamId)

  return `https://slack.com/oauth/v2/authorize?${params.toString()}`
}
