import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { useBindChannelEvent } from '@/hooks/useBindChannelEvent'
import { useGetCurrentOrganization } from '@/hooks/useGetCurrentOrganization'
import { useIsOrganizationMember } from '@/hooks/useIsOrganizationMember'
import { useOrganizationChannel } from '@/hooks/useOrganizationChannel'
import { apiClient } from '@/utils/queryClient'

export function useCallsSubscriptions() {
  const queryClient = useQueryClient()
  const isOrgMember = useIsOrganizationMember()
  const { data: organization } = useGetCurrentOrganization({ enabled: isOrgMember })
  const organizationChannel = useOrganizationChannel(organization)

  const invalidateCallsQuery = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: apiClient.organizations.getCalls().baseKey })
  }, [queryClient])

  useBindChannelEvent(organizationChannel, 'calls-stale', invalidateCallsQuery)
}
