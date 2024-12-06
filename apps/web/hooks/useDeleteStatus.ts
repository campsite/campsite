import { useQueryClient } from '@tanstack/react-query'
import { filter, isTruthy, uniqBy } from 'remeda'

import { OrganizationMember, OrganizationMembershipStatus } from '@campsite/types'

import { apiClient, getTypedQueryData } from '@/utils/queryClient'

import { useOptimisticMutation } from './useOptimisticMutation'

interface DeleteStatusParams {
  org: string
}

export function useDeleteStatus() {
  const queryClient = useQueryClient()

  return useOptimisticMutation({
    mutationFn: ({ org }: DeleteStatusParams) => apiClient.organizations.deleteMembersMeStatuses().request(org),
    optimisticFns: ({ org }) => {
      const currentUser = getTypedQueryData(queryClient, apiClient.users.getMe().requestKey())

      if (!currentUser) return []

      const memberQueryKey = apiClient.organizations.getMembersByUsername().requestKey(org, currentUser.username)
      const currentMember = getTypedQueryData(queryClient, memberQueryKey)

      if (!currentMember) return []

      return [
        {
          query: {
            queryKey: memberQueryKey,
            exact: true
          },
          updater: (old: OrganizationMember): OrganizationMember => ({
            ...old,
            status: null
          })
        },
        {
          query: {
            queryKey: apiClient.organizations.getMembersMeStatuses().requestKey(org),
            exact: true
          },
          updater: (old: OrganizationMembershipStatus[]): OrganizationMembershipStatus[] =>
            uniqBy(filter([currentMember.status, ...old], isTruthy), (s) => s.message)
        }
      ]
    }
  })
}
