import { useMutation, useQueryClient } from '@tanstack/react-query'

import { usePusherSocketIdHeader } from '@/contexts/pusher'
import { useScope } from '@/contexts/scope'
import { apiClient } from '@/utils/queryClient'
import {
  createOptimisticTimelineEvent,
  insertPostTimelineEvent,
  useOptimisticTimelineEventMemberActor
} from '@/utils/timelineEvents/optimistic'

const deletePostsResolution = apiClient.organizations.deletePostsResolution()

type Props = {
  postId: string
}

export function useUnresolvePost() {
  const { scope } = useScope()
  const queryClient = useQueryClient()
  const headers = usePusherSocketIdHeader()
  const { member } = useOptimisticTimelineEventMemberActor()

  return useMutation({
    mutationFn: ({ postId }: Props) => deletePostsResolution.request(`${scope}`, postId, { headers }),
    onSuccess: (_, { postId }) => {
      if (!member) return

      insertPostTimelineEvent({
        queryClient,
        scope,
        postId,
        timelineEvent: createOptimisticTimelineEvent({ action: 'post_unresolved', member })
      })
    }
  })
}
