import { useMemo } from 'react'

import { useGetPost } from '@/hooks/useGetPost'
import { flattenInfiniteData } from '@/utils/flattenInfiniteData'

import { useGetCurrentUser } from './useGetCurrentUser'
import { useGetPostComments } from './useGetPostComments'

export function usePostCommentDefaultMentionables({ postId }: { postId: string }) {
  const { data: currentUser } = useGetCurrentUser()
  const getComments = useGetPostComments({
    postId,
    /**
     * By default, queries refetch on mount if they are stale. This works great in most cases,
     * but here we end up with a race condition.
     *
     * When a new comment is created, we never invalidate the query. Instead, we directly mutate
     * the cache with optimistic and server responses. This means that the comments will be stale
     * for most of the time.
     *
     * Since this hook gets mounted with each comment, we don't want to refetch comments each time
     * as it can lead to a race conditions where we blow away the optimistic comment and fail to
     * replace it with the server response.
     */
    refetchOnMount: false
  })
  const { data: post } = useGetPost({ postId })

  return useMemo(() => {
    if (!post) return []

    const postAuthor = post.member.user.id === currentUser?.id ? [] : [post.member]
    const existingComments = flattenInfiniteData(getComments.data)?.map((comment) => comment.member) ?? []
    const feedbackRequests = post.feedback_requests?.map((fr) => fr.member) ?? []

    return [...postAuthor, ...feedbackRequests, ...existingComments].filter((member) => !member.user.integration)
  }, [currentUser?.id, getComments.data, post])
}
