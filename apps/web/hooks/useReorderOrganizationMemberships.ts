import { useCallback } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { PublicOrganizationMembership } from '@campsite/types'

import { apiClient, setTypedQueryData } from '@/utils/queryClient'

const getOrganizationMemberships = apiClient.organizationMemberships.getOrganizationMemberships()

export function useReorderOrganizationMemberships() {
  const queryClient = useQueryClient()

  // optimistically update the cache without making an API call while dragging
  const onReorder = useCallback(
    (ids: string[]) => {
      setTypedQueryData(queryClient, getOrganizationMemberships.requestKey(), (prev) => {
        if (!prev) return prev
        const idToMembership = prev.reduce(
          (acc, membership) => {
            acc[membership.id] = membership
            return acc
          },
          {} as Record<string, PublicOrganizationMembership>
        )
        const reordered = ids.map((id) => idToMembership[id]).filter(Boolean)

        return reordered
      })
    },
    [queryClient]
  )

  const mutation = useMutation({
    mutationFn: (membership_ids: string[]) =>
      apiClient.organizationMemberships.putOrganizationMembershipsReorder().request({
        membership_ids
      }),
    onMutate: async (ids) => {
      await queryClient.cancelQueries({ queryKey: getOrganizationMemberships.requestKey() })

      onReorder(ids)
    }
  })

  return { onReorder, mutation }
}
