import { useCallback } from 'react'

import { Organization } from '@campsite/types'

import { useGetCurrentOrganization } from './useGetCurrentOrganization'

type Props = {
  enabled?: boolean
}

export function useViewerIsAdmin({ enabled }: Props = {}): boolean {
  const select: (data: Organization) => boolean = useCallback((data) => data?.viewer_is_admin, [])
  const { data } = useGetCurrentOrganization({ enabled, select })

  return Boolean(data)
}
