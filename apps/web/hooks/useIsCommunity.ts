import { COMMUNITY_SLUG } from '@campsite/config'

import { useScope } from '@/contexts/scope'

export function useIsCommunity() {
  const { scope } = useScope()

  return scope === COMMUNITY_SLUG
}
