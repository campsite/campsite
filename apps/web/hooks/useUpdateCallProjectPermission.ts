import { useMutation, useQueryClient } from '@tanstack/react-query'

import { OrganizationsOrgSlugCallsCallIdProjectPermissionPutRequest } from '@campsite/types/generated'

import { useScope } from '@/contexts/scope'
import { useQueryNormalizer } from '@/utils/normy/QueryNormalizerProvider'
import { apiClient, getTypedQueryData, setTypedInfiniteQueriesData, setTypedQueryData } from '@/utils/queryClient'
import { createNormalizedOptimisticUpdate, getNormalizedData } from '@/utils/queryNormalization'

const getSyncProjects = apiClient.organizations.getSyncProjects()
const getFollowUps = apiClient.organizations.getFollowUps()
const getProjectCalls = apiClient.organizations.getProjectsCalls()

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
      const previousCall = getNormalizedData({ queryNormalizer, type: 'call', id: callId })
      const syncProjects = getTypedQueryData(queryClient, getSyncProjects.requestKey(`${scope}`))
      const project = syncProjects?.find((p) => p.id === data.project_id)

      if (previousCall?.project && previousCall.project.id !== data.project_id) {
        setTypedInfiniteQueriesData(
          queryClient,
          getProjectCalls.requestKey({ orgSlug: `${scope}`, projectId: previousCall.project.id }),
          (old) => {
            return old
              ? {
                  ...old,
                  pages: old.pages.map((page) => ({
                    ...page,
                    data: page.data.filter((call) => call.id !== previousCall.id) || []
                  }))
                }
              : old
          }
        )

        if (previousCall.project_pin_id) {
          setTypedQueryData(
            queryClient,
            apiClient.organizations.getProjectsPins().requestKey(`${scope}`, previousCall.project.id),
            (oldData) => {
              return {
                ...oldData,
                data: oldData?.data.filter((pin) => pin.id !== previousCall.project_pin_id) || []
              }
            }
          )
        }
      }

      return createNormalizedOptimisticUpdate({
        queryNormalizer,
        type: 'call',
        id: callId,
        update: {
          project_permission: data.permission,
          project,
          project_pin_id: null
        }
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getFollowUps.requestKey({ orgSlug: `${scope}` }) })
    }
  })
}
