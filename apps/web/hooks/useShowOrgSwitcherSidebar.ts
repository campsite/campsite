import { useGetOrganizationMemberships } from './useGetOrganizationMemberships'

export function useShowOrgSwitcherSidebar() {
  const { data: memberships } = useGetOrganizationMemberships()
  const isInMultipleOrganizations = memberships && memberships.length > 1

  return isInMultipleOrganizations
}
