import { useMutation, useQueryClient } from '@tanstack/react-query'

import { OrganizationActivityViewsPostRequest } from '@campsite/types'

import { useScope } from '@/contexts/scope'
import { apiClient, setTypedQueryData } from '@/utils/queryClient'

export function useCreateActivityView() {
  const { scope } = useScope()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: OrganizationActivityViewsPostRequest) =>
      apiClient.organizations.postActivityViews().request(`${scope}`, data),
    onSuccess: async (result) => {
      setTypedQueryData(queryClient, apiClient.users.getMeNotificationsUnreadAllCount().requestKey(), result)
    }
  })
}
