import { CAMPSITE_SCOPE } from '@campsite/config'

import { useScope } from '@/contexts/scope'

export function useIsCampsiteScope() {
  const { scope } = useScope()

  return { isCampsiteScope: scope === CAMPSITE_SCOPE }
}
