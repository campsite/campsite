import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAtom } from 'jotai'
import { atomFamily } from 'jotai/utils'

import { SyncOrganizationMember } from '@campsite/types'

import { useScope } from '@/contexts/scope'
import { useGetCurrentUser } from '@/hooks/useGetCurrentUser'
import { atomWithWebStorage } from '@/utils/atomWithWebStorage'
import { commandScoreSort } from '@/utils/commandScoreSort'
import { apiClient } from '@/utils/queryClient'

const syncedMembersAtom = atomFamily((scope: string) =>
  atomWithWebStorage<SyncOrganizationMember[]>(`members:sync:${scope}`, [])
)

const getSyncMembers = apiClient.organizations.getSyncMembers()

type Props = {
  enabled?: boolean
  includeDeactivated?: boolean
  deactivated?: boolean
  excludeCurrentUser?: boolean
  onlyRole?: SyncOrganizationMember['role']
  query?: string
}

export function useSyncedMembers({
  enabled = true,
  includeDeactivated = false,
  deactivated = false,
  excludeCurrentUser = false,
  onlyRole,
  query = ''
}: Props = {}) {
  const { scope } = useScope()
  const { data: currentUser } = useGetCurrentUser()
  const [members, setMembers] = useAtom(syncedMembersAtom(`${scope}`))

  const { refetch, isLoading, isPending, isFetching } = useQuery({
    queryKey: getSyncMembers.requestKey(`${scope}`),
    queryFn: async () => {
      const results = await getSyncMembers.request(`${scope}`)

      setMembers(results)
      return results
    },
    enabled: !!scope && enabled
  })

  const filtered = useMemo(() => {
    let temp = members

    if (excludeCurrentUser) {
      temp = temp.filter((member) => member.user.id !== currentUser?.id)
    }

    if (!includeDeactivated) {
      temp = temp.filter((member) => !member.deactivated)
    }

    if (deactivated) {
      temp = temp.filter((member) => member.deactivated)
    }

    if (onlyRole) {
      temp = temp.filter((member) => member.role === onlyRole)
    }

    return commandScoreSort(temp, query, (member) => `${member.user.username} ${member.user.display_name}`)
  }, [members, excludeCurrentUser, includeDeactivated, query, currentUser?.id, onlyRole, deactivated])

  return { members: filtered, refetch, isLoading, isPending, isFetching, total: members.length }
}
