import { CurrentUser } from '@campsite/types'

import { useGetCurrentUser } from './useGetCurrentUser'

export type UserFeatures = CurrentUser['features'][0]

export function useCurrentUserHasFeature(feature: UserFeatures) {
  const { data: currentUser } = useGetCurrentUser()

  return currentUser?.features?.includes(feature) as boolean
}
