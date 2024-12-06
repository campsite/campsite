import { useMutation, useQueryClient } from '@tanstack/react-query'

import { OrganizationsOrgSlugCallsCallIdProjectPermissionPutRequest } from '@campsite/types/generated'

import { useScope } from '@/contexts/scope'
import { useQueryNormalizer } from '@/utils/normy/QueryNormalizerProvider'
import { apiClient, getTypedQueryData } from '@/utils/queryClient'
import { createNormalizedOptimisticUpdate } from '@/utils/queryNormalization'

const getSyncProjects = apiClient.organizations.getSyncProjects()
const getFollowUps = apiClient.organizations.getFollowUps()

interface Props extends OrganizationsOrgSlugCallsCallIdProjectPermissionPutRequest {
  callId: string
}

export function useUpdateCallProjectPermission() {
  const { scope } = useScope()
  const queryClient = useQueryClient()
  const queryNormalizer = useQueryNormalizer()

  return useMutation({
    scope: { id: 'update-project-permission' },
    mutationFn: ({ callId, ...data }: Props) =>
      apiClient.organizations.putCallsProjectPermission().request(`${scope}`, callId, data),
    onMutate: ({ callId, ...data }) => {
      const syncProjects = getTypedQueryData(queryClient, getSyncProjects.requestKey(`${scope}`))
      const project = syncProjects?.find((p) => p.id === data.project_id)

      // TODO: Update getProjectPins cache when call pins implemented.

      return createNormalizedOptimisticUpdate({
        queryNormalizer,
        type: 'call',
        id: callId,
        update: {
          project_permission: data.permission,
          project
          // TODO: Update project_pin_id when call pins implemented.
        }
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getFollowUps.requestKey({ orgSlug: `${scope}` }) })
    }
  })
}
