import { FIGMA_CLIENT_ID } from 'lib/figma'

import { RAILS_API_URL } from '@campsite/config'

import { useGetCurrentUser } from './useGetCurrentUser'
import { useIntegrationAuthUrl } from './useIntegrationAuthUrl'

type Props = {
  successPath?: string
}

export const figmaConnectionSuccessPath = '/figma-connection-success'

export const useFigmaAuthorizationUrl = (props?: Props) => {
  const success_path = props?.successPath || figmaConnectionSuccessPath
  const params = new URLSearchParams()
  const { data: currentUser } = useGetCurrentUser()

  params.set('client_id', FIGMA_CLIENT_ID)
  params.set('redirect_uri', `${RAILS_API_URL}/v1/integrations/figma/callback`)
  params.set('scope', 'files:read,file_comments:write,webhooks:write')
  params.set('response_type', 'code')
  params.set('state', currentUser?.id || '')

  return useIntegrationAuthUrl({
    auth_url: `https://www.figma.com/oauth?${params.toString()}`,
    success_path
  })
}
