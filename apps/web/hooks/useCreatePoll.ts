import { useMutation } from '@tanstack/react-query'

import { OrganizationsOrgSlugPostsPostIdPoll2PostRequest } from '@campsite/types'

import { useScope } from '@/contexts/scope'
import { useQueryNormalizer } from '@/utils/normy/QueryNormalizerProvider'
import { apiClient } from '@/utils/queryClient'
import { createNormalizedOptimisticUpdate } from '@/utils/queryNormalization'

type Props = {
  postId: string
}

export function useCreatePoll({ postId }: Props) {
  const { scope } = useScope()
  const queryNormalizer = useQueryNormalizer()

  return useMutation({
    mutationFn: (data: OrganizationsOrgSlugPostsPostIdPoll2PostRequest) =>
      apiClient.organizations.postPostsPoll2().request(`${scope}`, postId, data),
    onMutate: (data) => {
      return createNormalizedOptimisticUpdate({
        queryNormalizer,
        type: 'post',
        id: postId,
        update: {
          poll: {
            id: `temp-poll-post-${postId}`,
            description: data.description,
            votes_count: 0,
            options: data.options.map((option, i) => ({
              id: `temp-poll-post-${postId}-option-${i}`,
              description: option.description,
              votes_count: 0,
              votes_percent: 0,
              viewer_voted: false
            })),
            viewer_voted: false
          }
        }
      })
    }
  })
}
