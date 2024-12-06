import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { Post } from '@campsite/types'

import { useScope } from '@/contexts/scope'
import { useQueryNormalizer } from '@/utils/normy/QueryNormalizerProvider'
import { apiClient } from '@/utils/queryClient'
import { setNormalizedData } from '@/utils/queryNormalization'

import { useBindChannelEvent } from './useBindChannelEvent'
import { usePostChannel } from './usePostChannel'

const getPostsByPostId = apiClient.organizations.getPostsByPostId()
const getPostComments = apiClient.organizations.getPostsComments()
const getPostCanvasComments = apiClient.organizations.getPostsCanvasComments()
const getAttachmentsById = apiClient.organizations.getAttachmentsById()
const getPostAttachmentComments = apiClient.organizations.getPostsAttachmentsComments()
const getPostsTimelineEvents = apiClient.organizations.getPostsTimelineEvents()
const getPostLinearTimelineEvents = apiClient.organizations.getPostsLinearTimelineEvents()

export function useLivePostUpdates(post: Post | undefined) {
  const { scope } = useScope()
  const queryClient = useQueryClient()
  const queryNormalizer = useQueryNormalizer()
  const postChannel = usePostChannel(post)

  const invalidateReactionQueries = useCallback(
    function (e: { post_id: string; subject_type: string; user_id: string }) {
      if (e.subject_type === 'Post') {
        queryClient.invalidateQueries({ queryKey: getPostsByPostId.requestKey(`${scope}`, e.post_id) })
      } else if (e.subject_type === 'Comment') {
        queryClient.invalidateQueries({
          queryKey: getPostComments.requestKey({ orgSlug: `${scope}`, postId: e.post_id })
        })
        queryClient.invalidateQueries({
          queryKey: getPostCanvasComments.requestKey(`${scope}`, e.post_id)
        })
      }
    },
    [queryClient, scope]
  )

  const invalidateCommentQueries = useCallback(
    function (e: { subject_id: string; user_id: string; attachment_id: string | null }) {
      queryClient.invalidateQueries({ queryKey: getPostsByPostId.requestKey(`${scope}`, e.subject_id) })
      queryClient.invalidateQueries({
        queryKey: getPostComments.requestKey({ orgSlug: `${scope}`, postId: e.subject_id })
      })
      queryClient.invalidateQueries({
        queryKey: getPostCanvasComments.requestKey(`${scope}`, e.subject_id)
      })

      if (e.attachment_id) {
        queryClient.invalidateQueries({
          queryKey: getAttachmentsById.requestKey(`${scope}`, e.attachment_id)
        })
        queryClient.invalidateQueries({
          queryKey: getPostAttachmentComments.requestKey({
            orgSlug: `${scope}`,
            postId: e.subject_id,
            attachmentId: e.attachment_id
          })
        })
      }
    },
    [queryClient, scope]
  )

  const updateContent = useCallback(
    function (e: { user_id: string | null; attributes: Partial<Post> }) {
      if (!post?.id) return

      setNormalizedData({ queryNormalizer, type: 'post', id: post?.id, update: e.attributes })
    },
    [queryNormalizer, post?.id]
  )

  const invalidatePostQuery = useCallback(
    function ({ post_id }: { post_id: string | null }) {
      if (!post_id) return

      queryClient.invalidateQueries({ queryKey: getPostsByPostId.requestKey(`${scope}`, post_id) })
    },
    [queryClient, scope]
  )

  const invalidatePostTimelineQuery = useCallback(
    function () {
      if (!post?.id) return

      queryClient.invalidateQueries({
        queryKey: getPostsTimelineEvents.requestKey({ orgSlug: `${scope}`, postId: post.id })
      })
      queryClient.invalidateQueries({
        queryKey: getPostLinearTimelineEvents.requestKey({ orgSlug: `${scope}`, postId: post.id })
      })
    },
    [post?.id, queryClient, scope]
  )

  useBindChannelEvent(postChannel, 'reactions-stale', invalidateReactionQueries)
  useBindChannelEvent(postChannel, 'comments-stale', invalidateCommentQueries)
  useBindChannelEvent(postChannel, 'content-stale', updateContent)
  useBindChannelEvent(postChannel, 'invalidate-post', invalidatePostQuery)
  useBindChannelEvent(postChannel, 'timeline-events-stale', invalidatePostTimelineQuery)
}
