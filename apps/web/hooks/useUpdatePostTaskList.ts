import { useMutation } from '@tanstack/react-query'

import { OrganizationsOrgSlugPostsPostIdTasksPutRequest } from '@campsite/types'

import { useScope } from '@/contexts/scope'
import { apiClient } from '@/utils/queryClient'

export function useUpdatePostTaskList(id: string) {
  const { scope } = useScope()

  return useMutation({
    mutationFn: (data: OrganizationsOrgSlugPostsPostIdTasksPutRequest) =>
      apiClient.organizations.putPostsTasks().request(`${scope}`, id, data)
  })
}
