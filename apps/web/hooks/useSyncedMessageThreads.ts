import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAtom } from 'jotai'
import { atomFamily } from 'jotai/utils'

import { SyncMessageThreads } from '@campsite/types'

import { useScope } from '@/contexts/scope'
import { atomWithWebStorage } from '@/utils/atomWithWebStorage'
import { apiClient } from '@/utils/queryClient'

const syncedThreadsAtom = atomFamily((scope: string) =>
  atomWithWebStorage<SyncMessageThreads>(`threads:sync:${scope}`, { threads: [], new_thread_members: [] })
)

interface Props {
  enabled?: boolean
  excludeProjectChats?: boolean
}

export function useSyncedMessageThreads({ enabled = true, excludeProjectChats = false }: Props = {}) {
  const { scope } = useScope()
  const [threads, setThreads] = useAtom(syncedThreadsAtom(`${scope}`))
  const query = apiClient.organizations.getSyncMessageThreads()

  const { refetch } = useQuery({
    queryKey: query.requestKey(`${scope}`),
    queryFn: async () => {
      const results = await query.request(`${scope}`)

      setThreads(results)
      return results
    },
    enabled: !!scope && enabled
  })

  const filtered = useMemo(() => {
    let temp = threads

    if (excludeProjectChats) {
      temp = {
        ...temp,
        threads: temp.threads.filter((thread) => !thread.project_id)
      }
    }

    return temp
  }, [excludeProjectChats, threads])

  return { threads: filtered, refetch }
}
