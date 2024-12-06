import { useMutation, useQueryClient } from '@tanstack/react-query'

import { OrganizationsOrgSlugPostsPostIdResolutionPostRequest } from '@campsite/types'

import { usePusherSocketIdHeader } from '@/contexts/pusher'
import { useScope } from '@/contexts/scope'
import { apiClient } from '@/utils/queryClient'
import {
  createOptimisticTimelineEvent,
  insertPostTimelineEvent,
  useOptimisticTimelineEventMemberActor
} from '@/utils/timelineEvents/optimistic'

const postPostsResolution = apiClient.organizations.postPostsResolution()

type Props = OrganizationsOrgSlugPostsPostIdResolutionPostRequest & {
  postId: string
}

export function useResolvePost() {
  const { scope } = useScope()
  const queryClient = useQueryClient()
  const headers = usePusherSocketIdHeader()
  const { member } = useOptimisticTimelineEventMemberActor()

  return useMutation({
    mutationFn: ({ postId, ...data }: Props) => postPostsResolution.request(`${scope}`, postId, data, { headers }),
    onSuccess: (_, { postId }) => {
      if (!member) return

      insertPostTimelineEvent({
        queryClient,
        scope,
        postId,
        timelineEvent: createOptimisticTimelineEvent({ action: 'post_resolved', member })
      })
    }
  })
}
