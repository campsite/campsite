import { useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useToken } from 'src/core/tokens'

import { ALL_SLACK_SCOPES } from '@campsite/config/src/slack'

import { client } from '../client'
import { useAuthorizationUrl as useIntegrationAuthorizationUrl } from './integrations'
import { useGetQuery as useGetOrganizationQuery } from './organizations'

export interface AuthorizationUrlOptions {
  scopes: string[]
  redirectUri: string
  organization?: string
  teamId?: string | null
  enabled?: boolean
}

export function useAuthorizationUrl({ scopes, redirectUri, organization, teamId }: AuthorizationUrlOptions) {
  const { data: currentOrganization } = useGetOrganizationQuery(organization)

  const params = new URLSearchParams()

  params.set('scope', scopes.join(','))
  params.set('state', currentOrganization?.id || '')
  params.set('redirect_uri', redirectUri)
  params.set('client_id', window.SLACKBOT_CLIENT_ID)
  if (teamId) params.set('team', teamId)

  return `https://slack.com/oauth/v2/authorize?${params.toString()}`
}

export interface BroadcastsAuthorizationUrlOptions {
  organization?: string
  enableNotifications?: boolean
  enabled?: boolean
}

export const useBroadcastsAuthorizationUrl = ({
  organization,
  enableNotifications,
  enabled = true
}: BroadcastsAuthorizationUrlOptions) => {
  const redirectUri = `${window.API_URL}/v1/organizations/${organization}/integrations/slack/callback`
  const auth_url = useAuthorizationUrl({ scopes: ALL_SLACK_SCOPES, redirectUri, organization, enabled })
  const success_path = '/'

  return useIntegrationAuthorizationUrl({ auth_url, success_path, enable_notifications: enableNotifications })
}

export function useIntegrationQuery(organization: string | undefined) {
  const token = useToken()

  return useQuery({
    queryKey: [token, organization, 'integrations', 'slack'],
    queryFn: () =>
      client.organizations.getIntegrationsSlack().request(organization ?? '', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }),
    enabled: !!organization,
    refetchOnWindowFocus: 'always',
    staleTime: 1000 * 60, // 1 minute
    cacheTime: 1000 * 60 * 60 // 1 hour
  })
}

interface SearchOptions {
  query: string
  organization?: string
}

export function useSearchQuery(options: SearchOptions) {
  const token = useToken()

  const organizationRef = useRef(options.organization)

  return useQuery({
    queryKey: [token, 'org', options.organization, 'integrations', 'slack', options.query],
    queryFn: ({ signal, pageParam }) =>
      client.organizations.getIntegrationsSlackChannels().request(
        {
          orgSlug: options.organization ?? '',
          q: options.query,
          limit: 50
        },
        {
          signal,
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      ),
    keepPreviousData: organizationRef.current === options.organization,
    enabled: !!token && !!options.organization,
    onSuccess() {
      organizationRef.current = options.organization
    },
    select(data) {
      return data.data
    }
  })
}
