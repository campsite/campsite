import { useQuery } from '@tanstack/react-query'
import { useAtom } from 'jotai'
import { atomFamily } from 'jotai/utils'

import { SyncCustomReaction } from '@campsite/types'

import { useScope } from '@/contexts/scope'
import { atomWithWebStorage } from '@/utils/atomWithWebStorage'
import { apiClient } from '@/utils/queryClient'

const syncedCustomReactionsAtom = atomFamily((scope: string) =>
  atomWithWebStorage<SyncCustomReaction[]>(`custom_reactions:sync:${scope}`, [])
)

const getSyncCustomReactions = apiClient.organizations.getSyncCustomReactions()

export function useSyncedCustomReactions() {
  const { scope } = useScope()
  const [customReactions, setCustomReactions] = useAtom(syncedCustomReactionsAtom(`${scope}`))

  const { refetch } = useQuery({
    queryKey: getSyncCustomReactions.requestKey(`${scope}`),
    queryFn: async () => {
      const results = await getSyncCustomReactions.request(`${scope}`)

      setCustomReactions(results)
      return results
    },
    enabled: !!scope,
    staleTime: 1000 * 60 * 60 // 1 hour
  })

  return { customReactions, refetch }
}
