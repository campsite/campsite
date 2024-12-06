import { useMutation, useQueryClient } from '@tanstack/react-query'

import { OrganizationsOrgSlugPostsPostIdViewsPostRequest, PostView } from '@campsite/types'

import { useScope } from '@/contexts/scope'
import { useQueryNormalizer } from '@/utils/normy/QueryNormalizerProvider'
import { apiClient, getTypedQueryData, setTypedInfiniteQueriesData, setTypedQueryData } from '@/utils/queryClient'
import { createNormalizedOptimisticUpdate, getNormalizedData, setNormalizedData } from '@/utils/queryNormalization'

import { useUpdateBadgeCount } from './useGetUnreadNotificationsCount'

type Props = OrganizationsOrgSlugPostsPostIdViewsPostRequest & {
  postId: string
  clearUnseenComments?: boolean
}

export function useCreatePostView() {
  const { scope } = useScope()
  const queryClient = useQueryClient()
  const updateBadgeCount = useUpdateBadgeCount()
  const queryNormalizer = useQueryNormalizer()

  return useMutation({
    mutationFn: ({ postId, ...data }: Props) =>
      apiClient.organizations.postPostsViews().request(`${scope}`, postId, data),
    onMutate: async ({ postId, clearUnseenComments, read }) => {
      const getPostViewsKey = apiClient.organizations.getPostsViews().requestKey({ orgSlug: `${scope}`, postId })

      await queryClient.cancelQueries({ queryKey: getPostViewsKey })

      const currentUser = getTypedQueryData(queryClient, apiClient.users.getMe().requestKey())
      const previousPost = getNormalizedData({ queryNormalizer, type: 'post', id: postId })

      let bumpPostViews = false

      if (
        currentUser &&
        previousPost &&
        read &&
        !previousPost.viewer_is_author &&
        previousPost.viewer_is_organization_member &&
        !previousPost.viewer_has_viewed
      ) {
        const tempView: PostView = {
          id: 'temp',
          updated_at: new Date().toISOString(),
          member: {
            id: 'temp',
            deactivated: false,
            created_at: new Date().toISOString(),
            role: 'member',
            user: { ...currentUser, type_name: 'user' },
            is_organization_member: true,
            status: null
          }
        }

        setTypedInfiniteQueriesData(queryClient, getPostViewsKey, (old) => {
          bumpPostViews = true

          if (!old) {
            return {
              pageParams: [],
              pages: [{ data: [tempView] }]
            }
          }

          // Optimistically create a new post view, only if the user is not the post author and has not already viewed the post.
          return {
            ...old,
            pages: [
              {
                data: [tempView]
              },
              ...old.pages
            ]
          }
        })
      }

      return createNormalizedOptimisticUpdate({
        queryNormalizer,
        type: 'post',
        id: postId,
        update: (old) => ({
          views_count: old.views_count + (bumpPostViews ? 1 : 0),
          unseen_comments_count: clearUnseenComments ? 0 : old.unseen_comments_count,
          viewer_has_viewed: true
        })
      })
    },
    onSuccess: async ({ notification_counts, project_unread_status }, { postId, skip_notifications }) => {
      // this query is cancelled in onMutate but is often fetched at the same time as the mutation
      // invalidate it here to ensure that the query is fetched with the latest data
      await queryClient.invalidateQueries({
        queryKey: apiClient.organizations.getPostsViews().requestKey({ orgSlug: `${scope}`, postId })
      })

      // if the user has cached inbox notifications, we can optimistically
      // mark any notifications related to the current post as read. If we
      // do this, we can also revalidate the unread count displayed in the
      // sidebar.
      setTypedInfiniteQueriesData(queryClient, apiClient.organizations.getMembersMeNotifications().baseKey, (old) => {
        if (!old || skip_notifications) return old

        return {
          ...old,
          pages: old.pages.map((page) => {
            return {
              ...page,
              data: page.data.map((notification) => {
                if (notification.target.id === postId && notification.target.type === 'Post' && !notification.read) {
                  return {
                    ...notification,
                    read: true
                  }
                } else {
                  return notification
                }
              })
            }
          })
        }
      })

      if (notification_counts) {
        const unreadCountKey = apiClient.users.getMeNotificationsUnreadAllCount().requestKey()

        await queryClient.cancelQueries({ queryKey: unreadCountKey })
        setTypedQueryData(queryClient, unreadCountKey, notification_counts)
        updateBadgeCount(notification_counts)
      }

      if (project_unread_status) {
        setNormalizedData({
          queryNormalizer,
          type: 'project',
          id: project_unread_status.id,
          update: { unread_for_viewer: project_unread_status.unread_for_viewer }
        })
      }
    }
  })
}
