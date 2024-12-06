import { useScope } from '@/contexts/scope'

import { useGetCurrentUser } from './useGetCurrentUser'
import { useGetOrganizationMemberships } from './useGetOrganizationMemberships'

type Options = {
  orgSlug: string
}

export function useIsOrganizationMember(options?: Options) {
  const { scope } = useScope()
  const orgSlug = options?.orgSlug ?? scope
  const { data: currentUser } = useGetCurrentUser()
  const { data: organizations } = useGetOrganizationMemberships({ enabled: !!currentUser?.logged_in })

  return !!organizations?.some(({ organization }) => organization.slug === orgSlug)
}
