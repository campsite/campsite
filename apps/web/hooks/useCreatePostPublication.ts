import { useMutation, useQueryClient } from '@tanstack/react-query'

import { usePusherSocketIdHeader } from '@/contexts/pusher'
import { useScope } from '@/contexts/scope'
import { publishPostToQueryCache } from '@/hooks/useCreatePost'
import { apiClient } from '@/utils/queryClient'

const postPostsPublication = apiClient.organizations.postPostsPublication()
const getMembersMePersonalDraftPosts = apiClient.organizations.getMembersMePersonalDraftPosts()

export function useCreatePostPublication() {
  const { scope } = useScope()
  const queryClient = useQueryClient()
  const pusherSocketIdHeader = usePusherSocketIdHeader()

  return useMutation({
    mutationFn: (postId: string) => postPostsPublication.request(`${scope}`, postId, { headers: pusherSocketIdHeader }),
    onSuccess: (post) => {
      publishPostToQueryCache({ queryClient, scope: `${scope}`, post })

      queryClient.invalidateQueries({
        queryKey: getMembersMePersonalDraftPosts.requestKey({ orgSlug: `${scope}` })
      })
    }
  })
}
