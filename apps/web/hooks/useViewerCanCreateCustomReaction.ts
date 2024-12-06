import { useCallback } from 'react'

import { Organization } from '@campsite/types'

import { useGetCurrentOrganization } from './useGetCurrentOrganization'

export function useViewerCanCreateCustomReaction(): { viewerCanCreateCustomReaction: boolean } {
  const select: (data: Organization) => boolean = useCallback((data) => data?.viewer_can_create_custom_reaction, [])
  const { data: viewerCanCreateCustomReaction } = useGetCurrentOrganization({ select })

  return { viewerCanCreateCustomReaction: Boolean(viewerCanCreateCustomReaction) }
}
