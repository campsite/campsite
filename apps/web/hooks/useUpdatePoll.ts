import { useMutation } from '@tanstack/react-query'

import { OrganizationsOrgSlugPostsPostIdPoll2PutRequest } from '@campsite/types'

import { useScope } from '@/contexts/scope'
import { useQueryNormalizer } from '@/utils/normy/QueryNormalizerProvider'
import { apiClient } from '@/utils/queryClient'
import { createNormalizedOptimisticUpdate } from '@/utils/queryNormalization'

type Props = {
  postId: string
}

export function useUpdatePoll({ postId }: Props) {
  const { scope } = useScope()
  const queryNormalizer = useQueryNormalizer()

  return useMutation({
    mutationFn: (data: OrganizationsOrgSlugPostsPostIdPoll2PutRequest) =>
      apiClient.organizations.putPostsPoll2().request(`${scope}`, postId, data),
    onMutate: (data) => {
      return createNormalizedOptimisticUpdate({
        queryNormalizer,
        type: 'post',
        id: postId,
        update: (old) => ({
          poll: {
            id: old.poll?.id || `temp-poll-post-${postId}`,
            description: data.description,
            votes_count: old.poll?.votes_count || 0,
            options: data.options.map((option, i) => {
              const oldOption = old.poll ? old.poll.options.find((o) => o.id === option.id) : null

              return {
                id: oldOption?.id || `temp-poll-post-${postId}-option-${i}`,
                description: option.description,
                votes_count: oldOption?.votes_count || 0,
                votes_percent: oldOption?.votes_percent || 0,
                viewer_voted: oldOption?.viewer_voted || false
              }
            }),
            viewer_voted: old.poll?.viewer_voted || false
          }
        })
      })
    }
  })
}
