import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { useScope } from '@/contexts/scope'
import { apiErrorToast } from '@/utils/apiErrorToast'
import { apiClient, setTypedInfiniteQueriesData } from '@/utils/queryClient'

const query = apiClient.organizations.deleteTagsByTagName()

export function useDeleteTag() {
  const { scope } = useScope()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (name: string) => query.request(`${scope}`, name),
    onMutate: (name: string) => {
      setTypedInfiniteQueriesData(queryClient, apiClient.organizations.getTags().baseKey, (old) => {
        if (!old) return old
        return {
          ...old,
          pages: old.pages.map((page) => {
            return {
              ...page,
              data: page.data.filter((tag) => tag.name !== name)
            }
          })
        }
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiClient.organizations.getFavorites().baseKey })
      toast('Tag deleted')
    },
    onError: apiErrorToast
  })
}
