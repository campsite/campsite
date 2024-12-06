import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { OrganizationMembershipStatus } from '@campsite/types'

import { apiClient, getTypedQueriesData, setTypedQueriesData } from '@/utils/queryClient'

import { useBindCurrentUserEvent } from './useBindCurrentUserEvent'

interface UpdateStatusEvent {
  org: string
  member_username: string
  status: OrganizationMembershipStatus | null
}

export function useMemberStatusSubscriptions() {
  const queryClient = useQueryClient()

  const onUpdateStatus = useCallback(
    (event: UpdateStatusEvent) => {
      setTypedQueriesData(
        queryClient,
        apiClient.organizations.getMembersByUsername().requestKey(event.org, event.member_username),
        (old) => (old ? { ...old, status: event.status } : old)
      )

      const activeThreadIds = getTypedQueriesData(queryClient, apiClient.organizations.getThreadsById().baseKey).map(
        ([_, thread]) => thread?.id
      )

      const getThreadsById = apiClient.organizations.getThreadsById()

      activeThreadIds.forEach((threadId) => {
        if (!threadId) return

        setTypedQueriesData(queryClient, getThreadsById.requestKey(event.org, threadId), (old) => {
          if (!old) return old

          return {
            ...old,
            other_members: old.other_members.map((member) =>
              member.user.username === event.member_username ? { ...member, status: event.status } : member
            )
          }
        })
      })
    },
    [queryClient]
  )

  useBindCurrentUserEvent('update-status', onUpdateStatus)
}
