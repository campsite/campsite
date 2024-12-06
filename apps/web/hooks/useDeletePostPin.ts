import { useMutation, useQueryClient } from '@tanstack/react-query'

import { useScope } from '@/contexts/scope'
import { useQueryNormalizer } from '@/utils/normy/QueryNormalizerProvider'
import { apiClient, setTypedQueryData } from '@/utils/queryClient'
import { createNormalizedOptimisticUpdate } from '@/utils/queryNormalization'
import {
  createOptimisticTimelineEvent,
  insertPostTimelineEvent,
  useOptimisticTimelineEventMemberActor
} from '@/utils/timelineEvents/optimistic'

type Props = {
  pinId: string
  postId: string
  projectId: string
}

const getPostsTimelineEvents = apiClient.organizations.getPostsTimelineEvents()

export function useDeletePostPin() {
  const { scope } = useScope()
  const queryNormalizer = useQueryNormalizer()
  const queryClient = useQueryClient()
  const { member } = useOptimisticTimelineEventMemberActor()

  return useMutation({
    scope: { id: 'update-project-pin' },
    mutationFn: ({ pinId }: Props) => apiClient.organizations.deletePinsById().request(`${scope}`, pinId),
    onMutate: ({ postId, projectId, pinId }) => {
      setTypedQueryData(
        queryClient,
        apiClient.organizations.getProjectsPins().requestKey(`${scope}`, `${projectId}`),
        (oldData) => {
          return {
            ...oldData,
            data: oldData?.data.filter((pin) => pin.id !== pinId) || []
          }
        }
      )

      if (member) {
        insertPostTimelineEvent({
          queryClient,
          scope,
          postId,
          timelineEvent: createOptimisticTimelineEvent({ action: 'subject_unpinned', member })
        })
      }

      return createNormalizedOptimisticUpdate({
        queryNormalizer,
        type: 'post',
        id: postId,
        update: { project_pin_id: null }
      })
    },
    onError: (_err, { postId, projectId }) => {
      queryClient.invalidateQueries({ queryKey: getPostsTimelineEvents.requestKey({ orgSlug: `${scope}`, postId }) })
      queryClient.invalidateQueries({
        queryKey: apiClient.organizations.getProjectsPins().requestKey(`${scope}`, `${projectId}`)
      })
    }
  })
}
