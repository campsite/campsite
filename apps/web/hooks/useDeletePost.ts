import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/router'

import { Post } from '@campsite/types'

import { useGoBack } from '@/components/Providers/HistoryProvider'
import { usePusherSocketIdHeader } from '@/contexts/pusher'
import { useScope } from '@/contexts/scope'
import { apiClient, setTypedInfiniteQueriesData, setTypedQueryData } from '@/utils/queryClient'

type Props = {
  post: Post
}

export function useDeletePost() {
  const { scope } = useScope()
  const router = useRouter()
  const queryClient = useQueryClient()
  const goBack = useGoBack()
  const headers = usePusherSocketIdHeader()

  return useMutation({
    mutationFn: ({ post }: Props) =>
      apiClient.organizations.deletePostsByPostId().request(`${scope}`, post.id, { headers }),
    onMutate: async ({ post }: Props) => {
      const notificationsKey = apiClient.organizations.getMembersMeNotifications().baseKey

      await queryClient.cancelQueries({ queryKey: notificationsKey })

      setTypedInfiniteQueriesData(queryClient, notificationsKey, (old) => {
        if (!old) return
        return {
          ...old,
          pages: old.pages.map((page) => {
            return {
              ...page,
              data: page.data.filter((notification) => notification.target.id !== post.id)
            }
          })
        }
      })

      if (post.project_pin_id) {
        setTypedQueryData(
          queryClient,
          apiClient.organizations.getProjectsPins().requestKey(`${scope}`, post.project.id),
          (oldData) => {
            return {
              ...oldData,
              data: oldData?.data.filter((pin) => pin.id !== post.project_pin_id) || []
            }
          }
        )
      }
    },
    onSuccess: (_, { post }) => {
      const isViewingPost = router.pathname === '/[org]/posts/[postId]'
      const isViewingPostLightbox = router.query.masked === '/[org]/posts/[postId]'
      const isViewingPostVersionFeed = router.pathname === '/[org]/posts/[postId]/versions'

      // project feed
      queryClient.invalidateQueries({
        queryKey: apiClient.organizations
          .getProjectsPosts()
          .requestKey({ orgSlug: `${scope}`, projectId: post.project.id })
      })

      // discover feed
      queryClient.invalidateQueries({
        queryKey: apiClient.organizations.getPosts().requestKey({ orgSlug: `${scope}` })
      })

      // member feed
      queryClient.invalidateQueries({
        queryKey: apiClient.organizations.getMembersPosts().requestKey({
          orgSlug: `${scope}`,
          username: post.member.user.username
        })
      })

      // all tag feeds
      post.tags.map((tag) => {
        queryClient.invalidateQueries({
          queryKey: apiClient.organizations.getTagsPosts().requestKey({ orgSlug: `${scope}`, tagName: tag.name })
        })
      })

      // created posts feed
      queryClient.invalidateQueries({
        queryKey: apiClient.organizations.getMembersMeViewerPosts().requestKey({ orgSlug: `${scope}` })
      })

      // for me posts feed
      queryClient.invalidateQueries({
        queryKey: apiClient.organizations.getMembersMeForMePosts().requestKey({ orgSlug: `${scope}` })
      })

      // personal drafts feed
      queryClient.invalidateQueries({
        queryKey: apiClient.organizations.getMembersMePersonalDraftPosts().requestKey({ orgSlug: `${scope}` })
      })

      // on post view, redirect to org
      if (isViewingPost && !isViewingPostLightbox) {
        goBack({ fallbackPath: `/${scope}/posts` })
      }

      // could be anywhere, clear query params which hides the lightbox
      if (isViewingPostLightbox) {
        const query = router.query

        delete query.maskedQuery
        delete query.masked
        delete query.a
        delete query.cc
        delete query.ca

        return router.replace({ query })
      }

      if (isViewingPostVersionFeed) {
        queryClient.invalidateQueries({
          queryKey: apiClient.organizations.getPostsVersions().requestKey(`${scope}`, post.id)
        })

        return router.back()
      }
    },
    onError: () => {
      // invalidate notifications on error as we may have removed one and re-inserting may be error-prone
      queryClient.invalidateQueries({ queryKey: apiClient.organizations.getMembersMeNotifications().baseKey })

      // just invalidate project pins to put it back
      queryClient.invalidateQueries({ queryKey: apiClient.organizations.getProjectsPins().baseKey })
    }
  })
}
