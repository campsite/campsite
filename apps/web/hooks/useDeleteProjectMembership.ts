import { QueryKey, useMutation, useQueryClient } from '@tanstack/react-query'

import { SyncUser } from '@campsite/types'

import { usePusherSocketIdHeader } from '@/contexts/pusher'
import { useScope } from '@/contexts/scope'
import { useQueryNormalizer } from '@/utils/normy/QueryNormalizerProvider'
import { apiClient, getTypedQueryData, setTypedQueryData } from '@/utils/queryClient'
import { createNormalizedOptimisticUpdate } from '@/utils/queryNormalization'

import { useGetCurrentUser } from './useGetCurrentUser'

const getProjectMemberships = apiClient.organizations.getProjectMemberships()
const getFavorites = apiClient.organizations.getFavorites()

export const removeCurrentUser: unique symbol = Symbol()

export function useRemoveProjectFromMembershipsAndFavorites() {
  const queryClient = useQueryClient()
  const { data: currentUser } = useGetCurrentUser()
  const { scope } = useScope()

  return async ({ projectId, userId }: { projectId: string; userId: string | typeof removeCurrentUser }) => {
    const memberships = getProjectMemberships.requestKey(`${scope}`)
    const favorites = getFavorites.requestKey(`${scope}`)

    await Promise.all([memberships, favorites].map((queryKey) => queryClient.cancelQueries({ queryKey })))

    if (userId === removeCurrentUser || userId === currentUser?.id) {
      const removeProjectRollbackData: { queryKey: QueryKey; data: any }[] = [
        { queryKey: memberships, data: getTypedQueryData(queryClient, memberships) },
        { queryKey: favorites, data: getTypedQueryData(queryClient, favorites) }
      ]

      setTypedQueryData(queryClient, memberships, (old) => {
        return old?.filter((el) => el.project.id !== projectId)
      })
      setTypedQueryData(queryClient, favorites, (old) => {
        return old?.filter((el) => el.project?.id !== projectId)
      })

      return { removeProjectRollbackData }
    }
  }
}

export function useDeleteProjectMembership(projectId: string) {
  const queryClient = useQueryClient()
  const { scope } = useScope()
  const { data: currentUser } = useGetCurrentUser()
  const pusherSocketIdHeader = usePusherSocketIdHeader()
  const removeProjectFromMembershipsAndFavorites = useRemoveProjectFromMembershipsAndFavorites()
  const queryNormalizer = useQueryNormalizer()

  return useMutation({
    mutationFn: ({ user }: { user: SyncUser }) =>
      apiClient.organizations
        .deleteProjectsMemberships()
        .request(`${scope}`, projectId, { user_id: user.id }, { headers: pusherSocketIdHeader }),
    onMutate: async ({ user }) => {
      // don't optimistically update if the user is deleting someone else's project membership
      if (currentUser?.id !== user.id) return { removeProjectRollbackData: [] }

      return {
        ...createNormalizedOptimisticUpdate({
          queryNormalizer,
          type: 'project',
          id: projectId,
          update: {
            viewer_is_member: false,
            viewer_has_subscribed: false
          }
        }),
        ...(await removeProjectFromMembershipsAndFavorites({ projectId, userId: user.id }))
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: apiClient.organizations.getProjectsMembers().requestKey({ orgSlug: `${scope}`, projectId })
      })
      queryClient.invalidateQueries({
        queryKey: apiClient.organizations.getProjectsAddableMembers().requestKey({ orgSlug: `${scope}`, projectId })
      })
    },
    onError: (_, __, context) => {
      context?.removeProjectRollbackData?.forEach(({ queryKey, data }) => {
        queryClient.setQueriesData({ queryKey }, data)
      })
    }
  })
}
