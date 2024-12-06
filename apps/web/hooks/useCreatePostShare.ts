import { useMutation } from '@tanstack/react-query'

import { OrganizationPostSharesPostRequest } from '@campsite/types'

import { useScope } from '@/contexts/scope'
import { apiClient } from '@/utils/queryClient'

export function useCreatePostShare(postId: string) {
  const { scope } = useScope()

  return useMutation({
    mutationFn: (data: OrganizationPostSharesPostRequest) =>
      apiClient.organizations.postPostsShares().request(`${scope}`, postId, data)
  })
}
