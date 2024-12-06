import { useMutation } from '@tanstack/react-query'

import { OrganizationsOrgSlugCommentsCommentIdTasksPutRequest } from '@campsite/types'

import { useScope } from '@/contexts/scope'
import { apiClient } from '@/utils/queryClient'

export function useUpdateCommentTaskList(commentId: string) {
  const { scope } = useScope()

  return useMutation({
    mutationFn: (data: OrganizationsOrgSlugCommentsCommentIdTasksPutRequest) =>
      apiClient.organizations.putCommentsTasks().request(`${scope}`, commentId, data)
  })
}
