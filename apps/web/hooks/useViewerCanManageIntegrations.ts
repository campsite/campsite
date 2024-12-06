import { useCallback } from 'react'

import { Organization } from '@campsite/types'

import { useGetCurrentOrganization } from './useGetCurrentOrganization'

export function useViewerCanManageIntegrations(): { viewerCanManageIntegrations: boolean } {
  const select: (data: Organization) => boolean = useCallback((data) => data?.viewer_can_manage_integrations, [])
  const { data: viewerCanManageIntegrations } = useGetCurrentOrganization({ select })

  return { viewerCanManageIntegrations: Boolean(viewerCanManageIntegrations) }
}
