import { OrgFeatures, useCurrentOrganizationHasFeature } from './useCurrentOrganizationHasFeature'
import { useCurrentUserHasFeature, UserFeatures } from './useCurrentUserHasFeature'

export function useCurrentUserOrOrganizationHasFeature(feature: UserFeatures & OrgFeatures) {
  const currentUserHasFeature = useCurrentUserHasFeature(feature)
  const currentOrganizationHasFeature = useCurrentOrganizationHasFeature(feature)

  return currentUserHasFeature || currentOrganizationHasFeature
}
