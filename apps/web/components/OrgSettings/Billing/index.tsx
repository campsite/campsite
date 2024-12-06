import { UserCircleIcon } from '@campsite/ui'

import { EmptyState } from '@/components/EmptyState'
import { useGetCurrentOrganization } from '@/hooks/useGetCurrentOrganization'
import { useViewerIsAdmin } from '@/hooks/useViewerIsAdmin'

import { Paid } from './Paid'
import { Upgrade } from './Upgrade'

export function Billing() {
  const getCurrentOrganization = useGetCurrentOrganization()
  const currentOrganization = getCurrentOrganization.data
  const viewerIsAdmin = useViewerIsAdmin()

  if (!currentOrganization) return null

  if (!viewerIsAdmin) {
    return (
      <EmptyState
        icon={<UserCircleIcon size={32} />}
        title='Admin role required'
        message='Only organization admins can manage your team’s billing settings. Reach out to an admin for help.'
      />
    )
  }

  if (currentOrganization.paid) return <Paid />
  return <Upgrade />
}
