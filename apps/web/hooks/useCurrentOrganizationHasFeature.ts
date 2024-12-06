import { Organization } from '@campsite/types'

import { useGetCurrentOrganizationFeatures } from './useGetOrganizationFeatures'

export type OrgFeatures = NonNullable<Organization['features']>[0]

export function useCurrentOrganizationHasFeature(feature: OrgFeatures) {
  const { data } = useGetCurrentOrganizationFeatures()

  return !!data?.features?.includes(feature)
}
