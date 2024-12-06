import { QueryKey, useMutation, useQueryClient } from '@tanstack/react-query'

import { useScope } from '@/contexts/scope'
import { apiClient, getTypedInfiniteQueryData, setTypedInfiniteQueriesData } from '@/utils/queryClient'

interface Props {
  callId: string
}

export function useDeleteAllCallRecordings({ callId }: Props) {
  const { scope } = useScope()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => apiClient.organizations.deleteCallsAllRecordings().request(`${scope}`, callId),
    onMutate: async () => {
      const queryKey = apiClient.organizations.getCalls().requestKey({ orgSlug: `${scope}` })

      await queryClient.cancelQueries({ queryKey })
      const previous = getTypedInfiniteQueryData(queryClient, queryKey)

      setTypedInfiniteQueriesData(queryClient, queryKey, (old) => {
        if (!old?.pages.length) return old

        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            data: page.data.filter((call) => call.id !== callId)
          }))
        }
      })

      return { removeAllCallRecordingData: { queryKey: queryKey as QueryKey, data: previous } }
    },
    onError: (_err, _vars, context) => {
      if (context?.removeAllCallRecordingData) {
        queryClient.setQueryData(context.removeAllCallRecordingData.queryKey, context.removeAllCallRecordingData.data)
      }
    }
  })
}
