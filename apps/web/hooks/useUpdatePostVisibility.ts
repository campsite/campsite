import { useMutation } from '@tanstack/react-query'

import { OrganizationsOrgSlugPostsPostIdVisibilityPutRequest } from '@campsite/types'

import { useScope } from '@/contexts/scope'
import { useQueryNormalizer } from '@/utils/normy/QueryNormalizerProvider'
import { apiClient } from '@/utils/queryClient'
import { createNormalizedOptimisticUpdate } from '@/utils/queryNormalization'

export function useUpdatePostVisibility(id: string) {
  const { scope } = useScope()
  const queryNormalizer = useQueryNormalizer()

  return useMutation({
    mutationFn: (data: OrganizationsOrgSlugPostsPostIdVisibilityPutRequest) =>
      apiClient.organizations.putPostsVisibility().request(`${scope}`, id, data),
    onMutate: async (data) => {
      return createNormalizedOptimisticUpdate({
        queryNormalizer,
        type: 'post',
        id,
        update: data
      })
    }
  })
}
