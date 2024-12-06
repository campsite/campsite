import { useMutation, useQueryClient } from '@tanstack/react-query'

import { OrganizationsOrgSlugPostsPostIdPutRequest, Post } from '@campsite/types'

import { usePusherSocketIdHeader } from '@/contexts/pusher'
import { useScope } from '@/contexts/scope'
import { useGetCurrentPostsFeedQueryKey } from '@/hooks/useGetCurrentPostsFeedQueryKey'
import { useQueryNormalizer } from '@/utils/normy/QueryNormalizerProvider'
import { apiClient, setTypedQueriesData, setTypedQueryData } from '@/utils/queryClient'
import { createNormalizedOptimisticUpdate, getNormalizedData } from '@/utils/queryNormalization'
import {
  createOptimisticTimelineEvent,
  insertPostTimelineEvent,
  isDateWithinRollupWindow,
  useOptimisticTimelineEventMemberActor
} from '@/utils/timelineEvents/optimistic'

type Props = OrganizationsOrgSlugPostsPostIdPutRequest & {
  id: string
}

export function useUpdatePost() {
  const { scope } = useScope()
  const queryClient = useQueryClient()
  const feedKey = useGetCurrentPostsFeedQueryKey()
  const queryNormalizer = useQueryNormalizer()
  const pusherSocketIdHeader = usePusherSocketIdHeader()
  const { member } = useOptimisticTimelineEventMemberActor()

  return useMutation({
    mutationKey: [scope, 'posts', 'update'],
    mutationFn: ({ id, ...data }: Props) =>
      apiClient.organizations.putPostsByPostId().request(`${scope}`, id, data, { headers: pusherSocketIdHeader }),
    onMutate: async ({ id, ...data }: Props) => {
      let optimisticUpdate: Partial<Post> = { ...data, title: data.title?.trim() }
      const previousPost = getNormalizedData({ queryNormalizer, type: 'post', id })

      // whem moving a post to a different project, clear the pin
      if (data.project_id && previousPost?.project_pin_id && previousPost.project.id !== data.project_id) {
        // clear the pin state from the post
        optimisticUpdate = { ...data, project_pin_id: null }

        setTypedQueryData(
          queryClient,
          apiClient.organizations.getProjectsPins().requestKey(`${scope}`, previousPost.project.id),
          (oldData) => {
            return {
              ...oldData,
              data: oldData?.data.filter((pin) => pin.id !== previousPost.project_pin_id) || []
            }
          }
        )
      }

      if (
        previousPost &&
        !isDateWithinRollupWindow(previousPost?.created_at) &&
        previousPost.title !== optimisticUpdate.title &&
        optimisticUpdate.title !== undefined &&
        member
      ) {
        insertPostTimelineEvent({
          queryClient,
          scope,
          postId: id,
          timelineEvent: createOptimisticTimelineEvent({
            action: 'subject_title_updated',
            member,
            subject_updated_from_title: previousPost?.title ?? null,
            subject_updated_to_title: data.title ?? null
          })
        })
      }

      return createNormalizedOptimisticUpdate({
        queryNormalizer,
        type: 'post',
        id,
        update: optimisticUpdate
      })
    },
    onSuccess: (post) => {
      if (feedKey) queryClient.invalidateQueries({ queryKey: feedKey })

      setTypedQueriesData(queryClient, apiClient.organizations.getFavorites().requestKey(`${scope}`), (old) => {
        if (!old) return

        return old.map((favorite) => {
          if (favorite.favoritable_id === post.id) {
            return {
              ...favorite,
              name: post.title
            }
          }

          return favorite
        })
      })
    },
    onError: () => {
      // just invalidate project pins to put it back
      queryClient.invalidateQueries({ queryKey: apiClient.organizations.getProjectsPins().baseKey })
    }
  })
}
