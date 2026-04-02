import { useMutation, useQueryClient } from '@tanstack/react-query'

import { useScope } from '@/contexts/scope'
import { useQueryNormalizer } from '@/utils/normy/QueryNormalizerProvider'
import { apiClient, setTypedInfiniteQueriesData, setTypedQueryData } from '@/utils/queryClient'
import { createNormalizedOptimisticUpdate, getNormalizedData } from '@/utils/queryNormalization'

type Props = {
  callId: string
}

export function useDeleteCallProjectPermission() {
  const { scope } = useScope()
  const queryClient = useQueryClient()
  const queryNormalizer = useQueryNormalizer()

  return useMutation({
    scope: { id: 'update-project-permission' },
    mutationFn: ({ callId }: Props) =>
      apiClient.organizations.deleteCallsProjectPermission().request(`${scope}`, callId),
    onMutate: ({ callId }) => {
      const previousCall = getNormalizedData({ queryNormalizer, type: 'call', id: callId })

      if (previousCall?.project) {
        setTypedInfiniteQueriesData(
          queryClient,
          apiClient.organizations.getProjectsCalls().requestKey({ orgSlug: `${scope}`, projectId: previousCall.project.id }),
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
          project_permission: 'none',
          project: null,
          project_pin_id: null
        }
      })
    }
  })
}
