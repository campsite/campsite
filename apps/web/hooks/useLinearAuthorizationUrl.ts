import { LINEAR_CALLBACK_URL, LINEAR_CLIENT_ID } from '@campsite/config'

import { useGetCurrentOrganization } from './useGetCurrentOrganization'
import { useIntegrationAuthUrl } from './useIntegrationAuthUrl'

export const linearConnectionSuccessPath = '/linear-connection-success'

export const useLinearAuthorizationUrl = () => {
  const getCurrentOrganization = useGetCurrentOrganization()
  const organization = getCurrentOrganization.data

  const params = new URLSearchParams()

  params.set('scope', 'issues:create')
  params.set('state', organization?.id || '')
  params.set('redirect_uri', LINEAR_CALLBACK_URL)
  params.set('response_type', 'code')
  params.set('actor', 'application')
  params.set('prompt', 'consent')
  params.set('client_id', LINEAR_CLIENT_ID)

  return useIntegrationAuthUrl({
    auth_url: `https://linear.app/oauth/authorize?${params.toString()}`,
    success_path: linearConnectionSuccessPath
  })
}
