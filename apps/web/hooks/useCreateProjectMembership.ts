import { useMutation, useQueryClient } from '@tanstack/react-query'

import { usePusherSocketIdHeader } from '@/contexts/pusher'
import { useScope } from '@/contexts/scope'
import { useQueryNormalizer } from '@/utils/normy/QueryNormalizerProvider'
import { apiClient, setTypedQueriesData } from '@/utils/queryClient'
import { createNormalizedOptimisticUpdate } from '@/utils/queryNormalization'

import { useGetCurrentUser } from './useGetCurrentUser'

const getProjectMemberships = apiClient.organizations.getProjectMemberships()

export function useCreateProjectMembership(projectId: string) {
  const queryClient = useQueryClient()
  const { scope } = useScope()
  const { data: currentUser } = useGetCurrentUser()
  const pusherSocketIdHeader = usePusherSocketIdHeader()
  const queryNormalizer = useQueryNormalizer()

  return useMutation({
    mutationFn: ({ userId }: { userId: string }) =>
      apiClient.organizations
        .postProjectsMemberships()
        .request(`${scope}`, projectId, { user_id: userId }, { headers: pusherSocketIdHeader }),
    onMutate: () => {
      return createNormalizedOptimisticUpdate({
        queryNormalizer,
        type: 'project',
        id: projectId,
        update: { viewer_is_member: true, viewer_has_subscribed: true }
      })
    },
    onSuccess: (projectMembership, { userId }) => {
      if (userId === currentUser?.id) {
        setTypedQueriesData(queryClient, getProjectMemberships.requestKey(`${scope}`), (old) => {
          if (!old || old.find((m) => m.project?.id === projectMembership.project.id)) return old
          return [projectMembership, ...old]
        })
      }

      queryClient.invalidateQueries({
        queryKey: apiClient.organizations.getProjectsMembers().requestKey({ orgSlug: `${scope}`, projectId })
      })
      queryClient.invalidateQueries({
        queryKey: apiClient.organizations.getProjectsAddableMembers().requestKey({ orgSlug: `${scope}`, projectId })
      })
    }
  })
}
